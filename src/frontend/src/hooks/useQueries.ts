import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlayerProfile, RaceResult, Track } from '../backend';

export function useInitializeTracks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.initializeTracks();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });
}

export function useGetTracks() {
  const { actor, isFetching } = useActor();

  return useQuery<Track[]>({
    queryKey: ['tracks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTracks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTrack(trackId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Track>({
    queryKey: ['track', trackId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getTrack(trackId);
    },
    enabled: !!actor && !isFetching && trackId > 0n,
  });
}

export function useCreatePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PlayerProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.createPlayer(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useGetPlayerProfile(playerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PlayerProfile>({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getPlayerProfile(playerId);
    },
    enabled: !!actor && !isFetching && !!playerId,
    retry: false,
  });
}

export function useSubmitRaceResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: RaceResult) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.submitRaceResult(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['player', variables.playerId] });
      queryClient.invalidateQueries({ queryKey: ['raceResults', variables.playerId] });
    },
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<PlayerProfile[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPlayerRaceResults(playerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RaceResult[]>({
    queryKey: ['raceResults', playerId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlayerRaceResults(playerId);
    },
    enabled: !!actor && !isFetching && !!playerId,
  });
}
