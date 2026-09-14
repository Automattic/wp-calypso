import type { Quarter } from '../constants';

const quarterIndex = ( { quarter, year }: Quarter ): number => year * 4 + ( quarter - 1 );

/**
 * Every quarter from `earliest` to `latest` inclusive, ordered newest-first.
 *
 * Used to populate the header quarter selector. If the range is empty or inverted,
 * returns `[ latest ]` so the selector always has at least the current reporting quarter.
 */
export function enumerateQuarters( earliest: Quarter, latest: Quarter ): Quarter[] {
	const from = quarterIndex( earliest );
	const to = quarterIndex( latest );

	if ( to < from ) {
		return [ latest ];
	}

	const quarters: Quarter[] = [];
	for ( let index = to; index >= from; index-- ) {
		quarters.push( {
			quarter: ( ( index % 4 ) + 1 ) as Quarter[ 'quarter' ],
			year: Math.floor( index / 4 ),
		} );
	}
	return quarters;
}
