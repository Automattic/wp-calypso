import type { Trophy } from '@automattic/api-core';

/**
 * Deduplicate trophies by type:
 * - For leveled achievements, keep the highest level.
 * - For site-based achievements, keep the first (oldest) unlock.
 */
export function deduplicateTrophies( trophies: Trophy[] ): Trophy[] {
	const map = new Map< string, Trophy >();

	for ( const trophy of trophies ) {
		const existing = map.get( trophy.type );
		if ( ! existing ) {
			map.set( trophy.type, trophy );
			continue;
		}

		// Keep the highest level.
		if ( trophy.level > existing.level ) {
			map.set( trophy.type, { ...trophy, message: existing.message, url: existing.url } );
			continue;
		}

		// For same level, keep the oldest (first unlocked). Trophies arrive newest-first.
		if ( trophy.level === existing.level ) {
			map.set( trophy.type, trophy );
		}
	}

	return Array.from( map.values() );
}

/**
 * Find the oldest site-based trophy of a given type.
 * A trophy is site-based when `url` is set; `message` is the site name.
 * Trophies arrive newest-first, so the last match is the oldest.
 */
export function getTrophyFirstSite(
	type: string,
	trophies: Trophy[]
): { name: string; url: string } | null {
	let oldest: Trophy | null = null;
	for ( const trophy of trophies ) {
		if ( trophy.type === type && trophy.url ) {
			oldest = trophy;
		}
	}
	return oldest ? { name: oldest.message, url: oldest.url } : null;
}

export function formatDate( dateString: string ): string {
	return new Date( dateString ).toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );
}
