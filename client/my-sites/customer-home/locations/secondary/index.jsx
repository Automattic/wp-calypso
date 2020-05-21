/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Stats from 'my-sites/customer-home/cards/features/stats';
import LearnGrow from './learn-grow';
import DiscoverEarn from './discover-earn';
import {
	FEATURE_STATS,
	SECTION_LEARN_GROW,
	SECTION_DISCOVER_EARN,
} from 'my-sites/customer-home/cards/constants';

const cardComponents = {
	[ FEATURE_STATS ]: Stats,
	[ SECTION_LEARN_GROW ]: LearnGrow,
	[ SECTION_DISCOVER_EARN ]: DiscoverEarn,
};

const Secondary = ( { cards } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card ) =>
					cardComponents[ card ] &&
					React.createElement( cardComponents[ card ], {
						key: card,
					} )
			) }
		</>
	);
};

export default Secondary;
