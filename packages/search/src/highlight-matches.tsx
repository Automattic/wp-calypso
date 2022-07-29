type Range = [ number, number ];
type Ranges = ReadonlyArray< Range >;

interface HighlightMatchesProps {
	s: string;
	ranges: Ranges;
	highlightClassname: string;
}

export function HighlightMatches( { s, ranges, highlightClassname }: HighlightMatchesProps ) {
	if ( ! ranges.length ) {
		return <>s</>;
	}

	return (
		<>
			{ calculateAllRanges( ranges, s.length ).map(
				( { indices: [ start, end ], isMatchingRange } ) => {
					const substring = s.substring( start, end + 1 );
					if ( isMatchingRange ) {
						return (
							<span key={ start } className={ highlightClassname }>
								{ substring }
							</span>
						);
					}
					return substring;
				}
			) }
		</>
	);
}

export function calculateAllRanges(
	ranges: Ranges,
	totalLength: number
): { indices: Range; isMatchingRange: boolean }[] {
	if ( ranges.length === 0 ) {
		return [];
	}

	const result = [] as { indices: Range; isMatchingRange: boolean }[];
	let i = 0;

	for ( let nextRangeIdx = 0; nextRangeIdx < ranges.length; nextRangeIdx++ ) {
		const [ nextRangeStart, nextRangeEnd ] = ranges[ nextRangeIdx ];
		if ( nextRangeStart > i ) {
			result.push( { indices: [ i, nextRangeStart - 1 ], isMatchingRange: false } );
		}
		result.push( { indices: [ nextRangeStart, nextRangeEnd ], isMatchingRange: true } );
		i = nextRangeEnd + 1;
	}

	const lastRangeEnd = ranges[ ranges.length - 1 ][ 1 ];
	if ( lastRangeEnd < totalLength - 1 ) {
		result.push( { indices: [ lastRangeEnd + 1, totalLength - 1 ], isMatchingRange: false } );
	}

	return result;
}
