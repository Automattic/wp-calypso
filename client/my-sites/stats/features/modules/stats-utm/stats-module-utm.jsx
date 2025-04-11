import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useSelector } from 'calypso/state';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { JETPACK_SUPPORT_URL_TRAFFIC, UTM_SUPPORT_URL } from '../../../const';
import useUTMMetricsQuery from '../../../hooks/use-utm-metrics-query';
import ErrorPanel from '../../../stats-error';
import StatsListCard from '../../../stats-list/stats-list-card';
import UTMBuilder from '../../../stats-module-utm-builder/';
import { StatsEmptyActionUTMBuilder } from '../shared';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import UTMDropdown from './stats-module-utm-dropdown';
import UTMExportButton from './utm-export-button';
import '../../../stats-module/style.scss';
import '../../../stats-list/style.scss';

const OPTION_KEYS = {
	SOURCE_MEDIUM: 'utm_source,utm_medium',
	CAMPAIGN_SOURCE_MEDIUM: 'utm_campaign,utm_source,utm_medium',
	SOURCE: 'utm_source',
	MEDIUM: 'utm_medium',
	CAMPAIGN: 'utm_campaign',
};

const UTM_QUERY_PARAM = 'utm_param';

const StatsModuleUTM = ( {
	path,
	className,
	useShortLabel,
	moduleStrings,
	summary,
	period,
	metricLabel,
	hideSummaryLink,
	isLoading,
	query,
	postId,
	summaryUrl,
	context,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.SOURCE_MEDIUM );
	const queryParams = useMemo( () => {
		let urlParams;

		if ( summaryUrl ) {
			urlParams = new URLSearchParams( summaryUrl?.split( '?' )[ 1 ] || '' );
		} else {
			urlParams = new URLSearchParams( context.query );
		}

		return urlParams;
	}, [ summary, summaryUrl, context.query ] );

	const getUrlWithUpdatedParams = ( url ) => {
		const currentUrl = new URL( url );
		let updatedParams;

		// Delete param in hash URL for Odyssey Stats if any.
		if ( isOdysseyStats && currentUrl.hash.startsWith( '#!' ) ) {
			const hashUrl = new URL( currentUrl.hash.substring( 2 ), currentUrl.origin );
			hashUrl.searchParams.set( UTM_QUERY_PARAM, selectedOption );
			currentUrl.hash = `#!${ hashUrl.pathname }${ hashUrl.search }`;
			updatedParams = Object.fromEntries( hashUrl.searchParams.entries() );
		} else {
			currentUrl.searchParams.set( UTM_QUERY_PARAM, selectedOption );
			updatedParams = Object.fromEntries( currentUrl.searchParams.entries() );
		}
		return { url: currentUrl, params: updatedParams };
	};

	useEffect( () => {
		const utmParam = queryParams.get( UTM_QUERY_PARAM );

		if ( utmParam && Object.values( OPTION_KEYS ).includes( utmParam ) ) {
			setSelectedOption( utmParam );
		}
	}, [ queryParams ] );

	useEffect( () => {
		if ( summary ) {
			const newUrlObj = getUrlWithUpdatedParams( window.location.href );

			// Odyssey would try to hack the URL on load to remove duplicate params. We need to wait for that to finish.
			setTimeout( () => {
				window.history.replaceState( null, '', newUrlObj.url.toString() );

				// Update context.query with new params
				if ( context && context.query ) {
					Object.assign( context.query, newUrlObj.params );
				}

				if ( isOdysseyStats ) {
					// We need to update the page base if it changed. Otherwise, pagejs won't be able to find the routes.
					page.base( `${ newUrlObj.url.pathname }${ newUrlObj.url.search }` );
				}
			}, 300 );
		}
	}, [ summary, selectedOption, isOdysseyStats ] );

	const optionLabels = {
		[ OPTION_KEYS.SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Source / Medium' ),
			headerLabel: translate( 'Posts by Source / Medium' ),
			isGrouped: true, // display in a group on top of the dropdown
		},
		[ OPTION_KEYS.CAMPAIGN_SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Campaign / Source / Medium' ),
			headerLabel: translate( 'Posts by Campaign / Source / Medium' ),
			isGrouped: true,
		},
		[ OPTION_KEYS.SOURCE ]: {
			selectLabel: translate( 'Source' ),
			headerLabel: translate( 'Posts by Source' ),
		},
		[ OPTION_KEYS.MEDIUM ]: {
			selectLabel: translate( 'Medium' ),
			headerLabel: translate( 'Posts by Medium' ),
		},
		[ OPTION_KEYS.CAMPAIGN ]: {
			selectLabel: translate( 'Campaign' ),
			headerLabel: translate( 'Posts by Campaign' ),
		},
	};

	// Fetch UTM metrics with switched UTM parameters.
	const { isFetching: isFetchingUTM, metrics: data } = useUTMMetricsQuery(
		siteId,
		selectedOption,
		query,
		postId
	);

	// Show error and loading based on the query
	const hasError = false;
	const displaySummaryLink = data && ! hideSummaryLink;
	const showLoader = isLoading || isFetchingUTM;

	const getHref = useMemo( () => {
		return () => {
			queryParams.set( UTM_QUERY_PARAM, selectedOption );

			// Some modules do not have view all abilities
			if ( ! summary && period && path && siteSlug ) {
				const basePath = `/stats/${ period.period }/${ path }/${ siteSlug }`;

				if ( ! queryParams.has( 'startDate' ) ) {
					queryParams.set( 'startDate', period.startOf.format( 'YYYY-MM-DD' ) );
				}
				if ( ! queryParams.has( 'endDate' ) ) {
					queryParams.set( 'endDate', period.endOf.format( 'YYYY-MM-DD' ) );
				}

				return `${ basePath }?${ queryParams.toString() }`;
			}
		};
	}, [ queryParams, selectedOption, period, path, siteSlug, summary, UTM_QUERY_PARAM ] );

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const supportUrl = isSiteJetpackNotAtomic
		? localizeUrl( `${ JETPACK_SUPPORT_URL_TRAFFIC }#harnessing-utm-stats-for-precision-tracking` )
		: UTM_SUPPORT_URL;

	const titleNodes = (
		<StatsInfoArea>
			{ translate(
				'Track your campaign {{link}}UTM performance data{{/link}}. Generate URL codes with our builder.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: <a target="_blank" rel="noreferrer" href={ supportUrl } />,
					},
					context: 'Stats: Popover information when the UTM module has data',
				}
			) }
		</StatsInfoArea>
	);

	return (
		<>
			{ showLoader && (
				<StatsCardSkeleton
					isLoading={ isFetchingUTM }
					className={ className }
					title={ moduleStrings.title }
					type={ 3 }
				/>
			) }
			{ ! showLoader &&
				! data?.length && ( // no data and new empty state enabled
					<StatsCard
						className={ className }
						title={ moduleStrings.title }
						titleNodes={ <StatsInfoArea /> }
						isEmpty
						emptyMessage={
							<EmptyModuleCard
								icon={ trendingUp }
								description={ translate(
									'Your {{link}}campaign UTM performance data{{/link}} will display here once readers click on your URLs with UTM codes. Get started!',
									{
										comment: '{{link}} links to support documentation.',
										components: {
											link: <a target="_blank" rel="noreferrer" href={ supportUrl } />,
										},
										context: 'Stats: Info box label when the UTM module is empty',
									}
								) }
								cards={ <UTMBuilder trigger={ <StatsEmptyActionUTMBuilder /> } /> }
							/>
						}
						footerAction={
							summaryUrl
								? {
										url: summaryUrl,
										label: translate( 'View more' ),
								  }
								: undefined
						}
					/>
				) }
			{ ! showLoader &&
				!! data?.length && ( // show when new empty state is disabled or data is available
					<StatsListCard
						className={ clsx( className, 'stats-module__card', path ) }
						moduleType={ path }
						data={ data }
						useShortLabel={ useShortLabel }
						title={ moduleStrings?.title }
						titleNodes={ titleNodes }
						emptyMessage={ <div>{ moduleStrings.empty }</div> }
						metricLabel={ metricLabel }
						downloadCsv={ <UTMExportButton data={ data } path={ path } period={ period } /> }
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
						splitHeader
						mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
						toggleControl={
							<div className="stats-module__extended-toggle">
								<UTMBuilder />
								<UTMDropdown
									buttonLabel={ optionLabels[ selectedOption ].selectLabel }
									onSelect={ setSelectedOption }
									selectOptions={ optionLabels }
									selected={ selectedOption }
								/>
							</div>
						}
					/>
				) }
		</>
	);
};

export { StatsModuleUTM as default, OPTION_KEYS };
