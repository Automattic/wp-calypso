import type {
	Achievement,
	EarnedAchievementEntry,
	LockedAchievementEntry,
	LockedSecretAchievement,
	MaskedSecretAchievement,
} from '@automattic/api-core';

/**
 * Find the oldest achievement of a given slug by comparing dates.
 */
export function getOldestAchievement(
	slug: string,
	achievements: Achievement[]
): Achievement | undefined {
	return achievements
		.filter( ( a ) => a.slug === slug )
		.reduce< Achievement | undefined >(
			( oldest, a ) => ( ! oldest || new Date( a.date ) < new Date( oldest.date ) ? a : oldest ),
			undefined
		);
}

/**
 * Deduplicate achievements by slug:
 * - For leveled achievements, keep the highest level.
 * - Otherwise, keep the oldest (first unlocked).
 */
export function deduplicateAchievementsBySlug( achievements: Achievement[] ): Achievement[] {
	// Build a map of slug → highest level for that slug.
	const highestBySlug = achievements.reduce( ( map, achievement ) => {
		const existing = map.get( achievement.slug );
		if ( ! existing || achievement.level > existing.level ) {
			map.set( achievement.slug, achievement );
		}
		return map;
	}, new Map< string, Achievement >() );

	// For each slug, merge the oldest achievement with the highest level and image.
	return Array.from( highestBySlug.entries() ).map( ( [ slug, highest ] ) => {
		const oldest = getOldestAchievement( slug, achievements );
		if ( oldest && oldest !== highest ) {
			return { ...oldest, level: highest.level, image: highest.image };
		}
		return highest;
	} );
}

/**
 * Deduplicate by `achievement_id`, keeping the first occurrence. Used for
 * shapes that lack a slug (masked secrets and locked entries) — the backend
 * may return the same id more than once for secret achievements.
 */
export function deduplicateAchievementsById< T extends { achievement_id: number } >(
	entries: T[]
): T[] {
	const seen = new Set< number >();
	const result: T[] = [];
	for ( const entry of entries ) {
		if ( ! seen.has( entry.achievement_id ) ) {
			seen.add( entry.achievement_id );
			result.push( entry );
		}
	}
	return result;
}

export const isFullyEarned = ( a: EarnedAchievementEntry ): a is Achievement =>
	a.is_secret !== true;

export const isMaskedSecret = ( a: EarnedAchievementEntry ): a is MaskedSecretAchievement =>
	a.is_secret === true;

export const isLockedSecret = ( a: LockedAchievementEntry ): a is LockedSecretAchievement =>
	a.is_secret === true;
