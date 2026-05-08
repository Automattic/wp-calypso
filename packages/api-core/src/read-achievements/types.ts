/**
 * Earned, fully-visible achievement. The shape returned for own-profile reads
 * and for non-secret entries on cross-user reads.
 */
export interface Achievement {
	achievement_id: number;
	slug: string;
	name: string;
	description: string;
	badge_prefix: string;
	level: number;
	date: string;
	image: string;
	retired: boolean;
	/** Optional — legacy responses (pre-locked-achievements rollout) omit it. */
	is_secret?: false;
	/** Only present when viewing your own achievements. */
	site_ID?: number;
	/** Only present when viewing your own achievements. */
	url?: string;
}

/**
 * Earned by the profile owner, masked because the requester has not earned
 * the same secret. Cross-user reads only.
 */
export interface MaskedSecretAchievement {
	achievement_id: number;
	is_secret: true;
	date: string;
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
	date_created: string;
	/** Current progress toward `target`. Present alongside `target` for incremental achievements. */
	progress?: number;
	/** Goal value for incremental achievements. Presence triggers progress UI. */
	target?: number;
}

/**
 * Locked + secret. Self-reads only.
 */
export interface LockedSecretAchievement {
	achievement_id: number;
	is_secret: true;
	date_created: string;
}

export type EarnedAchievementEntry = Achievement | MaskedSecretAchievement;
export type LockedAchievementEntry = LockedAchievement | LockedSecretAchievement;

export interface AchievementsResponse {
	found: number;
	achievements: EarnedAchievementEntry[];
	/** Self-reads only. Endpoint returns the full set on page 1; not paginated. */
	locked_achievements?: LockedAchievementEntry[];
	years_of_service?: number;
}
