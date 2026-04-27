import type { Trophy } from '@automattic/api-core';

/**
 * Find the oldest trophy of a given type by comparing dates.
 */
export function getOldestTrophy( type: string, trophies: Trophy[] ): Trophy | undefined {
	return trophies
		.filter( ( t ) => t.type === type )
		.reduce< Trophy | undefined >(
			( oldest, t ) => ( ! oldest || new Date( t.date ) < new Date( oldest.date ) ? t : oldest ),
			undefined
		);
}

/**
 * Deduplicate trophies by type:
 * - For leveled achievements, keep the highest level.
 * - Otherwise, keep the oldest (first unlocked).
 */
export function deduplicateTrophies( trophies: Trophy[] ): Trophy[] {
	// Build a map of type → highest level for that type.
	const highestByType = trophies.reduce( ( map, trophy ) => {
		const existing = map.get( trophy.type );
		if ( ! existing || trophy.level > existing.level ) {
			map.set( trophy.type, trophy );
		}
		return map;
	}, new Map< string, Trophy >() );

	// For each type, merge the oldest trophy with the highest level and image.
	return Array.from( highestByType.entries() ).map( ( [ type, highest ] ) => {
		const oldest = getOldestTrophy( type, trophies );
		if ( oldest && oldest !== highest ) {
			return { ...oldest, level: highest.level, image: highest.image };
		}
		return highest;
	} );
}
