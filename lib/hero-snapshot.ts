import { HEROES, isValidUsername, type Hero } from './mock-heroes';

export function decodeHeroSnapshot(value: string): Hero | null {
  if (value.length > 5000) return null;
  try {
    const data = JSON.parse(decodeURIComponent(atob(value)));
    const base = HEROES.find(hero => hero.art === data.art);
    if (!base || !isValidUsername(data.username) || data.source !== 'github' || typeof data.title !== 'string' || !data.title.trim() || data.title.length > 24 || typeof data.quote !== 'string' || !data.quote.trim() || data.quote.length > 70 || typeof data.language !== 'string' || data.language.length > 50 || !Number.isInteger(data.level) || data.level < 1 || data.level > 100 || !Array.isArray(data.stats) || data.stats.length !== 5) return null;
    if (data.stats.some((stat: {name?:unknown;value?:unknown}, index:number) => !stat || stat.name !== base.stats[index].name || !Number.isInteger(stat.value) || Number(stat.value) < 0 || Number(stat.value) > 100)) return null;
    return {...base,username:data.username,title:data.title,quote:data.quote,language:data.language,level:data.level,stats:data.stats.map((stat:{name:string;value:number}) => ({name:stat.name,value:stat.value})),source:'github'};
  } catch { return null; }
}
export function encodeHeroSnapshot(hero:Hero):string {
  return btoa(encodeURIComponent(JSON.stringify(hero)));
}
