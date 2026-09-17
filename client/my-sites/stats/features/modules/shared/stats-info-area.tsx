import { StatsCardTitleExtras } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import StatsInfotip from 'calypso/my-sites/stats/components/stats-infotip';

import './stats-info-area.scss';

type StatsInfoAreaProps = {
	isNew?: boolean;
	children?: React.ReactNode;
};

const StatsInfoArea: React.FC< StatsInfoAreaProps > = ( { isNew, children } ) => {
	const translate = useTranslate();

	return (
		<StatsCardTitleExtras
			prefixNodes={
				children ? (
					<StatsInfotip
						className="stats-info-area__popover"
						iconSize={ 24 }
						label={ translate( 'More information' ) }
						side="top"
					>
						{ children }
					</StatsInfotip>
				) : null
			}
			isNew={ isNew }
		/>
	);
};

export default StatsInfoArea;
