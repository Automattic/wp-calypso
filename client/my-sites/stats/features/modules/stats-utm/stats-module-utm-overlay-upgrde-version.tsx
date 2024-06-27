import React from 'react';
import StatsCardUpgradeJepackVersion from '../../../stats-card-upsell/stats-card-update-jetpack-version';
import StatsModuleUTMOverlay from './stats-module-utm-overlay';

type StatsModuleUTMOverlayUpgradeVersionProps = {
	siteId: number;
	className?: string;
};

const StatsModuleUTMOverlayUpgradeVersion: React.FC<
	StatsModuleUTMOverlayUpgradeVersionProps
> = ( { siteId, className } ) => {
	return (
		<StatsModuleUTMOverlay
			siteId={ siteId }
			className={ className }
			overlay={
				<StatsCardUpgradeJepackVersion
					className="stats-module__upsell stats-module__upgrade"
					siteId={ siteId }
					statType="utm"
				/>
			}
		/>
	);
};

export default StatsModuleUTMOverlayUpgradeVersion;
