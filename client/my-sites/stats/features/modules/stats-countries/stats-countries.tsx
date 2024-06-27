import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { megaphone } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL } from '../../../const';
import Geochart from '../../../geochart';
import StatsModule from '../../../stats-module';
import StatsModulePlaceholder from '../../../stats-module/placeholder';

type StatCountriesProps = {
	className?: string;
	period: string;
	query: string;
	moduleStrings: {
		title: string;
		item: string;
		value: string;
		empty: string;
	};
};

const StatCountries: React.FC< StatCountriesProps > = ( {
	period,
	query,
	moduleStrings,
	className,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsCountryViews';

	const requesting = useSelector( ( state: any ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

	return (
		<>
			{ requesting && <StatsModulePlaceholder isLoading={ requesting } /> }
			{ ( ! data || ! data?.length ) && (
				<StatsCard
					className={ className }
					title={ translate( 'Country Views' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ megaphone }
							description={ translate(
								'Stats on visitors and their {{link}}viewing location{{link}} will appear here',
								{
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#countries` ) } />,
									},
								}
							) }
						/>
					}
					children={ undefined }
				/>
			) }
			{ data && !! data.length && (
				<StatsModule
					path="countries"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ period }
					statType="statsCountryViews"
					showSummaryLink
					className={ className }
				>
					<Geochart query={ period } />
				</StatsModule>
			) }
		</>
	);
};

export default StatCountries;
