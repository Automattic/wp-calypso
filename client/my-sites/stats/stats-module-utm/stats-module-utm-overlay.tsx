import classNames from 'classnames';
import React from 'react';
import { STATS_FEATURE_UTM_STATS } from '../constants';
import StatsCardUpsellJetpack from '../stats-card-upsell/stats-card-upsell-jetpack';
import StatsListCard from '../stats-list/stats-list-card';

import './stats-module-utm-overlay.scss';

type StatsModuleUTMOverlayProps = {
	siteId: number;
	className?: string;
};

const StatsModuleUTMOverlay: React.FC< StatsModuleUTMOverlayProps > = ( { siteId, className } ) => {
	const fakeData = [
		{
			label: 'google / cpc',
			value: 102,
		},
		{
			label: 'linkedin / social',
			value: 15,
		},
		{
			label: 'google / organic',
			value: 14,
		},
		{
			label: 'facebook.com / social',
			value: 13,
		},
		{
			label: 'newsletter / email',
			value: 12,
		},
		{
			label: 'x.com / social',
			value: 12,
		},
		{
			label: 'rss / rss',
			value: 10,
		},
	];

	return (
		// @ts-expect-error TODO: Refactor StatsListCard with TypeScript.
		<StatsListCard
			title="UTM"
			className={ classNames( className, 'stats-module-utm-overlay', 'stats-module__card', 'utm' ) }
			moduleType="utm"
			data={ fakeData }
			mainItemLabel="Posts by Source / Medium"
			splitHeader
			showMore={ {
				label: 'View all',
			} }
			overlay={
				<StatsCardUpsellJetpack
					className="stats-module__upsell"
					siteId={ siteId }
					statType={ STATS_FEATURE_UTM_STATS }
				/>
			}
		></StatsListCard>
	);
};

export default StatsModuleUTMOverlay;
