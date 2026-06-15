import { settings } from "../config/settings";

export function getBestScore(): number {
  const storedScore = Number.parseInt(localStorage.getItem(settings.storageKey) ?? "0", 10);
  return Number.isFinite(storedScore) ? storedScore : 0;
}

export function saveBestScore(score: number): number {
  const bestScore = Math.max(score, getBestScore());
  localStorage.setItem(settings.storageKey, String(bestScore));
  return bestScore;
}
