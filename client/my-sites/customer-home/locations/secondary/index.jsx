/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Stats from 'my-sites/customer-home/cards/features/stats';
import LearnGrow from './learn-grow';

const cardComponents = {
	'home-feature-stats': Stats,
	'home-section-learn-grow': LearnGrow,
};

const Secondary = ( { cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map( ( card ) =>
				React.createElement( cardComponents[ card ], {
					key: card,
				} )
			) }
		</>
	);
};

export default Secondary;
