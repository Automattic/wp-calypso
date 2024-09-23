import config from '@automattic/calypso-config';
import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { JETPACK_SUPPORT_URL_TRAFFIC } from '../../../const';
import useUTMMetricsQuery from '../../../hooks/use-utm-metrics-query';
import ErrorPanel from '../../../stats-error';
import StatsListCard from '../../../stats-list/stats-list-card';
import StatsModulePlaceholder from '../../../stats-module/placeholder';
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

function generateFileNameForDownload( siteSlug, period ) {
	// Build a filename for the CSV export button.
	// The "format('L')" method can return strings that are not safe for the file system.
	// While the "saveAs" function handles this, we do it here for correctness.
	// We prefer '-' for word boundries, and '_' within words/dates.
	// This allows text editing shortcuts to work properly.
	//
	// example output: jetpack.com-utm-day-03_20_2024-03_20_2024.csv
	//
	const newFileName =
		[
			siteSlug,
			'utm',
			period.period,
			period.startOf.format( 'L' ),
			period.endOf.format( 'L' ),
		].join( '-' ) + '.csv';

	return newFileName.replace( /\//g, '_' );
}

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
} ) => {
	const isNewEmptyStateEnabled = config.isEnabled( 'stats/empty-module-traffic' );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const translate = useTranslate();

	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.SOURCE_MEDIUM );

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

	const getHref = () => {
		// Some modules do not have view all abilities
		if ( ! summary && period && path && siteSlug ) {
			return `/stats/${ period.period }/${ path }/${ siteSlug }?startDate=${ period.startOf.format(
				'YYYY-MM-DD'
			) }`;
		}
	};

	const showFooterWithDownloads = summary === true;
	const fileNameForExport = showFooterWithDownloads
		? generateFileNameForDownload( siteSlug, period )
		: '';

	const titleNodes = (
		<StatsInfoArea isNew>
			{ translate(
				'Track your campaign {{link}}UTM performance data{{/link}}. Generate URL codes with our builder.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: (
							<a
								href={ localizeUrl(
									`${ JETPACK_SUPPORT_URL_TRAFFIC }#harnessing-utm-stats-for-precision-tracking`
								) }
							/>
						),
					},
					context: 'Stats: Popover information when the UTM module has data',
				}
			) }
		</StatsInfoArea>
	);

	return (
		<>
			{ isNewEmptyStateEnabled && (
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
								className={ clsx( 'stats-card--empty-variant', className ) }
								title={ moduleStrings.title }
								titleNodes={ <StatsInfoArea isNew /> }
								isEmpty
								emptyMessage={
									<EmptyModuleCard
										icon={ trendingUp }
										description={ translate(
											'Your {{link}}campaign UTM performance data{{/link}} will display here once readers click on your URLs with UTM codes. Get started!',
											{
												comment: '{{link}} links to support documentation.',
												components: {
													link: (
														<a
															href={ localizeUrl(
																`${ JETPACK_SUPPORT_URL_TRAFFIC }#harnessing-utm-stats-for-precision-tracking`
															) }
														/>
													),
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
							<>
								<StatsListCard
									className={ clsx( className, 'stats-module__card', path ) }
									moduleType={ path }
									data={ data }
									useShortLabel={ useShortLabel }
									title={ moduleStrings?.title }
									titleNodes={ titleNodes }
									emptyMessage={ <div>{ moduleStrings.empty }</div> }
									metricLabel={ metricLabel }
									showMore={
										displaySummaryLink && ! summary
											? {
													url: getHref(),
													label:
														data.length >= 10
															? translate( 'View all', {
																	context:
																		'Stats: Button link to show more detailed stats information',
															  } )
															: translate( 'View details', {
																	context:
																		'Stats: Button label to see the detailed content of a panel',
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
								{ showFooterWithDownloads && (
									<div className="stats-module__footer-actions stats-module__footer-actions--summary">
										<UTMExportButton data={ data } fileName={ fileNameForExport } />
									</div>
								) }
							</>
						) }
				</>
			) }
			{ ! isNewEmptyStateEnabled && (
				<>
					<StatsListCard
						className={ clsx( className, 'stats-module__card', path ) }
						moduleType={ path }
						data={ data }
						useShortLabel={ useShortLabel }
						title={ moduleStrings?.title }
						emptyMessage={ <div>{ moduleStrings.empty }</div> }
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
					{ showFooterWithDownloads && (
						<div className="stats-module__footer-actions stats-module__footer-actions--summary">
							<UTMExportButton data={ data } fileName={ fileNameForExport } />
						</div>
					) }
				</>
			) }
		</>
	);
};

export { StatsModuleUTM as default, OPTION_KEYS };
