import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import StatsCardUpsellJetpack from '../stats-card-upsell/stats-card-upsell-jetpack';
import StatsListCard from '../stats-list/stats-list-card';

import './stats-module-devices.scss';

type StatsModuleUpgradeOverlayProps = {
	siteId: number;
	className?: string;
};

const StatsModuleUpgradeOverlay: React.FC< StatsModuleUpgradeOverlayProps > = ( {
	siteId,
	className,
} ) => {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) || '' );

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
			className={ classNames(
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
				<StatsCardUpsellJetpack
					className="stats-module__upsell"
					siteSlug={ siteSlug }
					tracksEvent="stats_devices_upgrade_clicked"
				/>
			}
		></StatsListCard>
	);
};

export default StatsModuleUpgradeOverlay;
