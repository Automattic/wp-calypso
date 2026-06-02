/**
 * Earned, fully-visible achievement. The shape returned for own-profile reads
 * and for non-secret entries on cross-user reads. A self-read of an earned
 * secret achievement also uses this shape — `is_secret` then reflects the
 * registry (`true`) but the payload is fully populated.
 */
export interface Achievement {
	achievement_id: number;
	slug: string;
	name: string;
	description: string;
	badge_prefix: string;
	level: number;
	date_unlocked: string;
	/** Y-m-d date the achievement was added to the registry. Used for sort order. */
	date_created: string;
	image: string;
	/**
	 * Y-m-d (or ISO 8601) date string when the achievement was retired, or
	 * an empty string / omitted when not retired. Truthy ⇒ retired.
	 */
	date_retired?: string;
	/**
	 * Reflects the registry: `true` if the achievement is secret, even when
	 * the payload is fully visible (self-read of an earned secret). Optional —
	 * legacy responses (pre-locked-achievements rollout) omit it.
	 */
	is_secret?: boolean;
	/** Always `false` (or omitted) for full payloads — see {@link MaskedSecretAchievement}. */
	is_redacted?: false;
	/** `true` for Automattic-only achievements. */
	is_a8c_only?: boolean;
	/** Only present when viewing your own achievements. */
	site_ID?: number;
	/** Only present when viewing your own achievements. */
	url?: string;
}

/**
 * Earned by the profile owner, masked because the requester has not earned
 * the same secret. Cross-user reads only. Discriminated from {@link Achievement}
 * by `is_redacted: true`.
 */
export interface MaskedSecretAchievement {
	achievement_id: number;
	is_secret: true;
	is_redacted: true;
	date_unlocked: string;
	/** Y-m-d date the achievement was added to the registry. Used for sort order. */
	date_created: string;
}

/**
 * Registry entry the requester has not earned yet. Self-reads only.
 * The endpoint omits an `image` URL — the UI renders a generic lock icon.
 */
export interface LockedAchievement {
	achievement_id: number;
	slug: string;
	name: string;
	description: string;
	badge_prefix: string;
	is_secret: false;
	/** Always `false` (or omitted) for full payloads — see {@link LockedSecretAchievement}. */
	is_redacted?: false;
	/** `true` for Automattic-only achievements. */
	is_a8c_only?: boolean;
	date_created: string;
	/** Current progress toward `target`. Present alongside `target` for incremental achievements. */
	progress?: number;
	/** Goal value for incremental achievements. Presence triggers progress UI. */
	target?: number;
}

/**
 * Locked + secret. Self-reads only. Discriminated from {@link LockedAchievement}
 * by `is_redacted: true`.
 */
export interface LockedSecretAchievement {
	achievement_id: number;
	is_secret: true;
	is_redacted: true;
	date_created: string;
}

export type EarnedAchievementEntry = Achievement | MaskedSecretAchievement;
export type LockedAchievementEntry = LockedAchievement | LockedSecretAchievement;

/**
 * Per-day status on the engagement streak timeline.
 * - `missed`: streak inactive, broken, or pending engagement that day.
 * - `extended`: streak active and engaged that day.
 * - `freeze_used`: day missed but a streak freeze protected the streak.
 */
export type EngagementStreakDayStatus = 'missed' | 'extended' | 'freeze_used';

export interface EngagementStreakDay {
	/** Y-m-d in the user's timezone. */
	date: string;
	status: EngagementStreakDayStatus;
	/** True when the user earned a streak freeze on this day. */
	freeze_earned: boolean;
}

/**
 * Engagement (activity) streak slice on the achievements endpoint response.
 * See: https://fieldguide.automattic.com/activity-streak/
 */
export interface EngagementStreak {
	current_streak: number;
	longest_streak: number;
	freezes_available: number;
	/** Y-m-d in the user's timezone; null if no freeze has been used. */
	freeze_used_date: string | null;
	next_freeze_in_days: number;
	/** Y-m-d in the user's timezone; null if the user has never engaged. */
	last_streak_date: string | null;
	/** Daily timeline, oldest → newest. Up to 30 entries. Optional for legacy responses. */
	days?: EngagementStreakDay[];
}

/**
 * A per-site daily-post streak: a contiguous run of days on which the user
 * published at least one post on the given blog. The endpoint returns only
 * currently-active streaks. Self-reads only.
 */
export interface DailyPostStreak {
	blog_id: number;
	url: string;
	current_streak: number;
}

export interface AchievementsResponse {
	found: number;
	achievements: EarnedAchievementEntry[];
	/** Self-reads only. Endpoint returns the full set on page 1; not paginated. */
	locked_achievements?: LockedAchievementEntry[];
	years_of_service?: number;
	/** Activity streak data. */
	engagement_streak?: EngagementStreak;
	/** Self-reads only. Per-site daily-post streaks. Not paginated. */
	daily_post_streak?: DailyPostStreak[];
}
