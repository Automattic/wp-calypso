/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StatsWeeklyTraffic from 'my-sites/customer-home/cards/features/stats';

const cardComponents = {
	'home-feature-stats-weekly-traffic': StatsWeeklyTraffic,
};

const Stats = ( { cards } ) => {
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

export default Stats;
