import { ApiError, generateHero } from '@/lib/hero-service';
import { isValidUsername, type Hero } from '@/lib/mock-heroes';

export const runtime = 'nodejs';
export const maxDuration = 60;
const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map<string,{hero:Hero;expires:number}>();
const pending = new Map<string,Promise<Hero>>();

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 512) throw new ApiError('요청이 너무 큽니다.', 413);
    let body;
    try { body = JSON.parse(raw); } catch { throw new ApiError('올바른 JSON 요청이 필요합니다.', 400); }
    if (!body || typeof body.username !== 'string' || !isValidUsername(body.username.trim())) throw new ApiError('올바른 GitHub username을 입력해주세요.', 400);
    const key = body.username.trim().toLowerCase();
    const saved = cache.get(key);
    if (saved && saved.expires > Date.now()) return Response.json({hero:saved.hero});
    let work = pending.get(key);
    if (!work) {
      if (pending.size >= 3) throw new ApiError('현재 생성 요청이 많습니다. 잠시 후 다시 시도해주세요.', 429);
      work = generateHero(key).then(hero => {
        if (cache.size >= 200) cache.delete(cache.keys().next().value!);
        cache.set(key,{hero,expires:Date.now()+CACHE_TTL}); return hero;
      }).finally(() => pending.delete(key));
      pending.set(key,work);
    }
    return Response.json({hero:await work});
  } catch (error) {
    return Response.json({error:error instanceof ApiError ? error.message : '카드를 생성하지 못했습니다.'},{status:error instanceof ApiError ? error.status : 500});
  }
}
