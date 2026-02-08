import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PlayerId = string;
export type Time = bigint;
export interface Track {
    id: bigint;
    difficulty: TrackDifficulty;
    name: string;
    length: bigint;
}
export interface PlayerProfile {
    id: PlayerId;
    nickname: string;
    stats: PlayerStats;
}
export interface RaceResult {
    completionTime: bigint;
    playerId: PlayerId;
    trackId: bigint;
    timestamp: Time;
    position: bigint;
}
export interface PlayerStats {
    averagePosition?: number;
    bestTime?: bigint;
    racesCompleted: bigint;
}
export enum TrackDifficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export interface backendInterface {
    createPlayer(profile: PlayerProfile): Promise<void>;
    getLeaderboard(): Promise<Array<PlayerProfile>>;
    getPlayerProfile(playerId: PlayerId): Promise<PlayerProfile>;
    getPlayerRaceResults(playerId: PlayerId): Promise<Array<RaceResult>>;
    getTrack(trackId: bigint): Promise<Track>;
    getTracks(): Promise<Array<Track>>;
    initializeTracks(): Promise<void>;
    submitRaceResult(result: RaceResult): Promise<void>;
}
