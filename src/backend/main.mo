import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";

actor {
  // Data Types
  type PlayerId = Text;

  type Track = {
    id : Nat;
    name : Text;
    difficulty : TrackDifficulty;
    length : Nat;
  };

  type TrackDifficulty = {
    #easy;
    #medium;
    #hard;
  };

  type RaceResult = {
    playerId : PlayerId;
    trackId : Nat;
    completionTime : Nat;
    position : Nat;
    timestamp : Time.Time;
  };

  type PlayerStats = {
    racesCompleted : Nat;
    bestTime : ?Nat;
    averagePosition : ?Float;
  };

  type PlayerProfile = {
    id : PlayerId;
    nickname : Text;
    stats : PlayerStats;
  };

  module RaceResult {
    public func compare(a : RaceResult, b : RaceResult) : Order.Order {
      Nat.compare(a.completionTime, b.completionTime);
    };
  };

  module PlayerProfile {
    public func compare(a : PlayerProfile, b : PlayerProfile) : Order.Order {
      switch (Text.compare(a.nickname, b.nickname)) {
        case (#equal) { PlayerStats.compare(a.stats, b.stats) };
        case (order) { order };
      };
    };

    public func compareByStats(a : PlayerProfile, b : PlayerProfile) : Order.Order {
      PlayerStats.compare(a.stats, b.stats);
    };
  };

  module PlayerStats {
    public func compare(a : PlayerStats, b : PlayerStats) : Order.Order {
      switch (compareTimes(b.bestTime, a.bestTime)) {
        case (#equal) { compareFloats(b.averagePosition, a.averagePosition) };
        case (order) { order };
      };
    };

    func compareTimes(a : ?Nat, b : ?Nat) : Order.Order {
      switch (a, b) {
        case (null, null) { #equal };
        case (null, _) { #greater };
        case (_, null) { #less };
        case (?timeA, ?timeB) { Nat.compare(timeA, timeB) };
      };
    };

    func compareFloats(a : ?Float, b : ?Float) : Order.Order {
      switch (a, b) {
        case (null, null) { #equal };
        case (null, _) { #greater };
        case (_, null) { #less };
        case (?floatA, ?floatB) { comparePrimitiveFloats(floatA, floatB) };
      };
    };

    func comparePrimitiveFloats(a : Float, b : Float) : Order.Order {
      if (a < b) { return #less };
      if (a > b) { #greater } else { #equal };
    };
  };

  // Persistent State
  let players = Map.empty<PlayerId, PlayerProfile>();
  let tracks = Map.empty<Nat, Track>();
  let raceResults = Map.empty<PlayerId, [RaceResult]>();

  // Initialization with Tracks
  public shared ({ caller }) func initializeTracks() : async () {
    if (tracks.size() == 0) {
      let defaultTracks : [Track] = [
        {
          id = 1;
          name = "Easy Loop";
          difficulty = #easy;
          length = 1000;
        },
        {
          id = 2;
          name = "Speed Circuit";
          difficulty = #medium;
          length = 2000;
        },
        {
          id = 3;
          name = "Grand Prix";
          difficulty = #hard;
          length = 3000;
        },
      ];
      for (track in defaultTracks.values()) {
        tracks.add(track.id, track);
      };
    };
  };

  // Player Profile Management
  public shared ({ caller }) func createPlayer(profile : PlayerProfile) : async () {
    if (players.containsKey(profile.id)) {
      Runtime.trap("Player ID already exists");
    };
    players.add(profile.id, profile);
  };

  public query ({ caller }) func getPlayerProfile(playerId : PlayerId) : async PlayerProfile {
    switch (players.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?profile) { profile };
    };
  };

  // Race Results Management
  public shared ({ caller }) func submitRaceResult(result : RaceResult) : async () {
    let playerResults : [RaceResult] = switch (raceResults.get(result.playerId)) {
      case (null) { [result] };
      case (?existing) { existing.concat([result]) };
    };
    raceResults.add(result.playerId, playerResults);
  };

  public query ({ caller }) func getPlayerRaceResults(playerId : PlayerId) : async [RaceResult] {
    switch (raceResults.get(playerId)) {
      case (null) { [] };
      case (?results) { results };
    };
  };

  // Track Management
  public query ({ caller }) func getTracks() : async [Track] {
    tracks.values().toArray();
  };

  public query ({ caller }) func getTrack(trackId : Nat) : async Track {
    switch (tracks.get(trackId)) {
      case (null) { Runtime.trap("Track not found") };
      case (?track) { track };
    };
  };

  // Leaderboard
  public query ({ caller }) func getLeaderboard() : async [PlayerProfile] {
    let sortedProfiles = players.values().toArray().sort(PlayerProfile.compareByStats);
    sortedProfiles.values().take(100).toArray();
  };
};
