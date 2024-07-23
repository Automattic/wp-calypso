import { StatsCardTitleExtras } from '@automattic/components';
import React from 'react';
import InfoPopover from 'calypso/components/info-popover';

import './stats-info-area.scss';

type StatsInfoAreaProps = {
	isNew?: boolean;
	children?: React.ReactNode;
};

const StatsInfoArea: React.FC< StatsInfoAreaProps > = ( { isNew, children } ) => {
	return (
		<StatsCardTitleExtras
			prefixNodes={
				children ? (
					<InfoPopover className="stats-info-area__popover" iconSize={ 24 } position="top">
						{ children }
					</InfoPopover>
				) : null
			}
			isNew={ isNew }
		/>
	);
};

export default StatsInfoArea;
