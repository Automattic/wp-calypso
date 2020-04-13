/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import LearnGrow from './learn-grow';
import Stats from 'my-sites/customer-home/cards/features/stats';

const cardComponents = {
	'home-feature-stats': Stats,
	'home-section-learn-grow': LearnGrow,
};

const Secondary = ( { cards } ) => {
	return (
		<>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
						} )
				) }
		</>
	);
};

export default Secondary;
