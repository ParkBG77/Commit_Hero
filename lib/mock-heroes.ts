export type Hero = {
  username: string; job: string; title: string; quote: string; level: number;
  stats: { name: string; value: number }[]; accent: string; art: string; language: string;
  source?: 'github';
};

export const HEROES: Hero[] = [
  { username: "ParkBG77", job: "ARCANE MAGE", title: "새벽의 버그 소환사", quote: "버그를 잡으러 왔다가, 새 버그를 소환했다.", level: 42, accent: "#bba5ff", art: "mage", language: "TypeScript",
    stats: [{ name: "힘", value: 64 }, { name: "민첩", value: 82 }, { name: "지능", value: 94 }, { name: "체력", value: 71 }, { name: "행운", value: 38 }] },
  { username: "steady-knight", job: "CODE KNIGHT", title: "잔디밭의 수호 기사", quote: "하루 한 커밋. 잔디에도 루틴이 필요하니까.", level: 36, accent: "#f4c977", art: "knight", language: "C#",
    stats: [{ name: "힘", value: 88 }, { name: "민첩", value: 58 }, { name: "지능", value: 73 }, { name: "체력", value: 96 }, { name: "행운", value: 52 }] },
  { username: "weekend-rogue", job: "SHADOW ROGUE", title: "주말에만 나타나는 로그", quote: "평일엔 기척도 없다. 토요일에 32커밋.", level: 28, accent: "#7fddbb", art: "rogue", language: "Python",
    stats: [{ name: "힘", value: 59 }, { name: "민첩", value: 97 }, { name: "지능", value: 81 }, { name: "체력", value: 46 }, { name: "행운", value: 76 }] },
];

export function isValidUsername(value: string): boolean {
  return /^(?!.*--)[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value);
}

// 목업 전용: GitHub 데이터를 읽거나 실제 성향을 추론하지 않는다.
export function createMockHero(username: string): Hero {
  const normalized = username.toLowerCase();
  const preset = HEROES.find(hero => hero.username.toLowerCase() === normalized);
  const hash = [...normalized].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return { ...(preset ?? HEROES[hash % HEROES.length]), username };
}
