type BoostRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

type BoostThreshold = {
	threshold: number;
	rating: BoostRating;
};

const BOOST_THRESHOLDS: BoostThreshold[] = [
	{ threshold: 90, rating: 'A' },
	{ threshold: 75, rating: 'B' },
	{ threshold: 50, rating: 'C' },
	{ threshold: 35, rating: 'D' },
	{ threshold: 25, rating: 'E' },
	{ threshold: 0, rating: 'F' },
];

export const getBoostRating = ( boostScore: number ): BoostRating => {
	for ( const { threshold, rating } of BOOST_THRESHOLDS ) {
		if ( boostScore > threshold ) {
			return rating;
		}
	}

	return 'F';
};

export const getBoostRatingClass = ( boostScore: number ): string => {
	const GOOD_BOOST_SCORE_THRESHOLD = 75;
	if ( boostScore > GOOD_BOOST_SCORE_THRESHOLD ) {
		return 'boost-score-good';
	}

	const OKAY_BOOST_SCORE_THRESHOLD = 35;
	if ( boostScore > OKAY_BOOST_SCORE_THRESHOLD ) {
		return 'boost-score-okay';
	}

	return 'boost-score-bad';
};
