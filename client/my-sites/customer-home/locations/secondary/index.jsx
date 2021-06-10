/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import QuickStartVideo from 'calypso/my-sites/customer-home/cards/education/quick-start-video';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import LearnGrow from './learn-grow';
import {
	FEATURE_STATS,
	SECTION_LEARN_GROW,
	FEATURE_QUICK_START_VIDEO,
	FEATURE_SUPPORT,
} from 'calypso/my-sites/customer-home/cards/constants';

const cardComponents = {
	[ FEATURE_STATS ]: Stats,
	[ FEATURE_QUICK_START_VIDEO ]: QuickStartVideo,
	[ SECTION_LEARN_GROW ]: LearnGrow,
	[ FEATURE_SUPPORT ]: HelpSearch,
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
