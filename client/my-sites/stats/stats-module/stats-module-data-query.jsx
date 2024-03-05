import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsCardUpsellJetpack from '../stats-card-upsell/stats-card-upsell-jetpack';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from './placeholder';

import './style.scss';
import '../stats-list/style.scss';

const StatsModuleDataQuery = ( {
	data,
	path,
	className,
	useShortLabel,
	moduleStrings,
	summary,
	period,
	metricLabel,
	hideSummaryLink,
	isLoading,
	selectedOption,
	toggleControl,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const translate = useTranslate();
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse: isAdvancedFeatureEnabled } =
		useStatsPurchases( siteId );
	const [ showLoader, setShowLoader ] = useState( isLoading || isLoadingFeatureCheck );

	// Show error and loading based on the query
	const hasError = false;

	const displaySummaryLink = data && ! hideSummaryLink;

	useEffect( () => {
		setShowLoader( isLoading || isLoadingFeatureCheck );
	}, [ isLoadingFeatureCheck, isLoading ] );

	const getHref = () => {
		// Some modules do not have view all abilities
		if ( ! summary && period && path && siteSlug ) {
			return `/stats/${ period.period }/${ path }/${ siteSlug }?startDate=${ period.startOf.format(
				'YYYY-MM-DD'
			) }`;
		}
	};

	return (
		<StatsListCard
			className={ classNames( className, 'stats-module__card', path ) }
			moduleType={ path }
			data={ data }
			useShortLabel={ useShortLabel }
			title={ moduleStrings?.title }
			emptyMessage={ moduleStrings.empty }
			metricLabel={ metricLabel }
			showMore={
				displaySummaryLink && ! summary
					? {
							url: getHref(),
							label:
								data.length >= 10
									? translate( 'View all', {
											context: 'Stats: Button link to show more detailed stats information',
									  } )
									: translate( 'View details', {
											context: 'Stats: Button label to see the detailed content of a panel',
									  } ),
					  }
					: undefined
			}
			error={ hasError && <ErrorPanel /> }
			loader={ showLoader && <StatsModulePlaceholder isLoading={ showLoader } /> }
			splitHeader
			mainItemLabel={ selectedOption?.headerLabel }
			toggleControl={ toggleControl }
			overlay={
				siteSlug &&
				! isAdvancedFeatureEnabled && (
					<StatsCardUpsellJetpack className="stats-module__upsell" siteSlug={ siteSlug } />
				)
			}
		/>
	);
};

export default StatsModuleDataQuery;
