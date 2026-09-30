import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateHero, ApiError } from '../lib/hero-service';
import { decodeHeroSnapshot, encodeHeroSnapshot } from '../lib/hero-snapshot';
import { HEROES } from '../lib/mock-heroes';
import { POST } from '../app/api/hero/route';

test('invalid username is rejected before network access', async () => {
  await assert.rejects(() => generateHero('../secret'), (e: unknown) => e instanceof ApiError && e.status === 400);
});
test('public GitHub data generates a personalized card; private data excluded', async () => {
  let prompt = '';
  const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('openai')) {
      prompt = String(init?.body);
      return Response.json({status:'completed', output:[{type:'message', content:[{type:'output_text', text:JSON.stringify({title:'C#의 수호자', quote:'세미콜론 하나로 왕국을 지킨다.'})}]}]});
    }
    if (url.includes('/repos?')) return Response.json([{private:false, language:'C#'}, {private:true, language:'SecretLanguage'}]);
    if (url.includes('/events/public?')) return Response.json([{id:'1', public:true, type:'PushEvent', created_at:new Date().toISOString()}, {id:'2', public:false, type:'PullRequestEvent', created_at:new Date().toISOString()}]);
    return Response.json({login:'example', type:'User', public_repos:1});
  };
  const hero = await generateHero('example', fakeFetch as typeof fetch, {OPENAI_API_KEY:'test'});
  assert.equal(hero.title, 'C#의 수호자');
  assert.equal(hero.language, 'C#');
  assert.equal(hero.source, 'github');
  assert.equal(JSON.parse(JSON.parse(prompt).input).eventCount, 1);
  assert.ok(!prompt.includes('SecretLanguage'));
});
test('GitHub missing account is a 404', async () => {
  const fakeFetch = async () => Response.json({}, {status:404});
  await assert.rejects(() => generateHero('missing', fakeFetch as typeof fetch, {OPENAI_API_KEY:'test'}), (e: unknown) => e instanceof ApiError && e.status === 404);
});
test('AI refusal is reported instead of silently showing a sample', async () => {
  const fakeFetch = async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes('openai')) return Response.json({status:'completed',output:[{content:[{type:'refusal', refusal:'no'}]}]});
    if (url.includes('?')) return Response.json([]);
    return Response.json({login:'example',type:'User',public_repos:0});
  };
  await assert.rejects(() => generateHero('example', fakeFetch as typeof fetch, {OPENAI_API_KEY:'test'}), (e: unknown) => e instanceof ApiError && e.status === 502);
});

test('shared Korean card restores exactly, and untrusted styles are replaced', () => {
  const card = {...HEROES[0], source:'github' as const, accent:'malicious-style'};
  const restored = decodeHeroSnapshot(encodeHeroSnapshot(card));
  assert.equal(restored?.quote, card.quote);
  assert.equal(restored?.accent, HEROES[0].accent);
  assert.equal(decodeHeroSnapshot(encodeHeroSnapshot({...card,stats:[{name:'evil',value:999}]})), null);
  assert.equal(decodeHeroSnapshot('invalid'), null);
});
test('missing OpenAI key is an actionable configuration error', async () => {
  await assert.rejects(() => generateHero('example', fetch, {}), (e:unknown) => e instanceof ApiError && e.status === 503);
});
test('GitHub rate limit is surfaced as 429', async () => {
  const fakeFetch = async () => Response.json({}, {status:403,headers:{'x-ratelimit-remaining':'0'}});
  await assert.rejects(() => generateHero('example', fakeFetch as typeof fetch, {OPENAI_API_KEY:'test'}), (e:unknown) => e instanceof ApiError && e.status === 429);
});
test('route rejects invalid JSON and oversized input without external calls', async () => {
  const invalid = await POST(new Request('http://localhost/api/hero', {method:'POST',body:'broken'}));
  assert.equal(invalid.status,400);
  const large = await POST(new Request('http://localhost/api/hero', {method:'POST',body:'x'.repeat(513)}));
  assert.equal(large.status,413);
});
