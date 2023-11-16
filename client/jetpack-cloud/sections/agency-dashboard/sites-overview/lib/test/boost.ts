import { getBoostRating, getBoostRatingClass } from '../boost';

describe( 'getBoostRating', () => {
	it.each( [
		[ 'A', 91, 100 ],
		[ 'B', 76, 90 ],
		[ 'C', 51, 75 ],
		[ 'D', 36, 50 ],
		[ 'E', 26, 35 ],
		[ 'F', 0, 25 ],
	] )(
		'should return a rating of "%s" for scores from %d to %d inclusive',
		( expectedRating, minScore, maxScore ) => {
			const minRating = getBoostRating( minScore );
			const maxRating = getBoostRating( maxScore );

			expect( minRating ).toEqual( expectedRating );
			expect( maxRating ).toEqual( expectedRating );
		}
	);
} );

describe( 'getBoostRatingClass', () => {
	it.each( [
		[ 'boost-score-good', 76, 100 ],
		[ 'boost-score-okay', 36, 75 ],
		[ 'boost-score-bad', 0, 35 ],
	] )(
		'should return the "%s" class for scores from %d to %d inclusive',
		( expectedClassName, minScore, maxScore ) => {
			const minClassName = getBoostRatingClass( minScore );
			const maxClassName = getBoostRatingClass( maxScore );

			expect( minClassName ).toEqual( expectedClassName );
			expect( maxClassName ).toEqual( expectedClassName );
		}
	);
} );
