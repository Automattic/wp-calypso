import type { Trophy } from '@automattic/api-core';

/**
 * Find the oldest trophy of a given type by comparing dates.
 */
export function getOldestTrophy( type: string, trophies: Trophy[] ): Trophy | null {
	let oldest: Trophy | null = null;
	for ( const trophy of trophies ) {
		if ( trophy.type === type ) {
			if ( ! oldest || new Date( trophy.date ) < new Date( oldest.date ) ) {
				oldest = trophy;
			}
		}
	}
	return oldest;
}

/**
 * Deduplicate trophies by type:
 * - For leveled achievements, keep the highest level.
 * - Otherwise, keep the oldest (first unlocked).
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
			map.set( trophy.type, trophy );
		}
	}

	// For each type, replace with the oldest trophy but preserve the highest level.
	for ( const [ type, trophy ] of map ) {
		const oldest = getOldestTrophy( type, trophies );
		if ( oldest && oldest !== trophy ) {
			map.set( type, { ...oldest, level: trophy.level, image: trophy.image } );
		}
	}

	return Array.from( map.values() );
}
