import type { Achievement } from '@automattic/api-core';

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
			( oldest, a ) =>
				! oldest || new Date( a.date_unlocked ) < new Date( oldest.date_unlocked ) ? a : oldest,
			undefined
		);
}

/**
 * Deduplicate achievements by slug, keeping the entry with the most recent
 * `date_unlocked` (the last unlock — typically also the highest level for
 * level-progression achievements). The "first unlocked" date used in card
 * captions is computed separately via {@link getOldestAchievement}.
 */
export function deduplicateAchievementsBySlug( achievements: Achievement[] ): Achievement[] {
	const latestBySlug = new Map< string, Achievement >();
	for ( const a of achievements ) {
		const existing = latestBySlug.get( a.slug );
		if ( ! existing || a.date_unlocked > existing.date_unlocked ) {
			latestBySlug.set( a.slug, a );
		}
	}
	return Array.from( latestBySlug.values() );
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
