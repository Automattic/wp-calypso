/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StatsWeeklyTraffic from 'my-sites/customer-home/cards/features/stats';

const cardComponents = {
	'home-feature-stats-weekly-traffic': StatsWeeklyTraffic,
};

const Stats = ( { cards } ) => {
	const translate = useTranslate();

	return (
		<>
			<h2>{ translate( 'Stats at a glance' ) }</h2>
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
