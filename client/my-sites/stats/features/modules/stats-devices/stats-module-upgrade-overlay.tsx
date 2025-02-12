import clsx from 'clsx';
import React from 'react';
import StatsCardUpsell from 'calypso/my-sites/stats/stats-card-upsell';
import { STATS_TYPE_DEVICE_STATS } from '../../../constants';
import StatsListCard from '../../../stats-list/stats-list-card';

import './stats-module-devices.scss';

type StatsModuleUpgradeOverlayProps = {
	siteId: number;
	className?: string;
	overlay?: React.ReactNode;
};

const StatsModuleUpgradeOverlay: React.FC< StatsModuleUpgradeOverlayProps > = ( {
	siteId,
	className,
	overlay,
} ) => {
	const fakeData = [
		{
			label: 'Windows',
			value: 120,
		},
		{
			label: 'Mac',
			value: 100,
		},
		{
			label: 'Android',
			value: 50,
		},
		{
			label: 'iOS',
			value: 35,
		},
		{
			label: 'Linux',
			value: 12,
		},
		{
			label: 'Chrome OS',
			value: 12,
		},
		{
			label: 'Unknown',
			value: 1,
		},
	];

	return (
		// @ts-expect-error TODO: Refactor StatsListCard with TypeScript.
		<StatsListCard
			title="Devices"
			className={ clsx(
				className,
				'stats-module-upgrade-overlay',
				'stats-module__card',
				'devices'
			) }
			moduleType="devices"
			data={ fakeData }
			mainItemLabel="Visitors"
			splitHeader
			overlay={
				overlay ?? (
					<StatsCardUpsell
						className="stats-module__upsell"
						siteId={ siteId }
						statType={ STATS_TYPE_DEVICE_STATS }
					/>
				)
			}
		/>
	);
};

export default StatsModuleUpgradeOverlay;
