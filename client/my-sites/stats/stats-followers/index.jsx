import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSiteSlug, isAdminInterfaceWPAdmin, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SUBSCRIBERS_SUPPORT_URL } from '../const';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

import './style.scss';

const MAX_FOLLOWERS_TO_SHOW = 10;

const StatModuleFollowers = ( { className } ) => {
	const translate = useTranslate();

	// Selectors
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAdminInterface = useSelector( ( state ) => isAdminInterfaceWPAdmin( state, siteId ) );

	// Query objects
	const emailQuery = { type: 'email', max: 10 };
	const wpcomQuery = { type: 'wpcom', max: 10 };

	// Stats data and loading states
	const requestingEmailFollowers = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'statsFollowers', emailQuery )
	);
	const emailData = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, 'statsFollowers', emailQuery )
	);
	const hasEmailQueryFailed = useSelector( ( state ) =>
		hasSiteStatsQueryFailed( state, siteId, 'statsFollowers', emailQuery )
	);
	const requestingWpcomFollowers = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'statsFollowers', wpcomQuery )
	);
	const wpcomData = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, 'statsFollowers', wpcomQuery )
	);
	const hasWpcomQueryFailed = useSelector( ( state ) =>
		hasSiteStatsQueryFailed( state, siteId, 'statsFollowers', wpcomQuery )
	);

	const calculateOffset = useCallback(
		( pastValue ) => {
			const now = new Date();
			const value = new Date( pastValue );
			const difference = now.getTime() - value.getTime();

			const seconds = Math.floor( difference / 1000 );
			const minutes = Math.floor( seconds / 60 );
			const hours = Math.floor( minutes / 60 );
			const days = Math.floor( hours / 24 );

			let result = '';

			if ( days > 0 ) {
				result = translate( '%d days', { args: days } );
			} else if ( hours > 0 ) {
				result = translate( '%d hours', { args: hours } );
			} else if ( minutes > 0 ) {
				result = translate( '%d minutes', { args: minutes } );
			}

			return result;
		},
		[ translate ]
	);

	const isLoading = requestingWpcomFollowers || requestingEmailFollowers;
	const hasEmailFollowers = !! get( emailData, 'subscribers', [] ).length;
	const hasWpcomFollowers = !! get( wpcomData, 'subscribers', [] ).length;
	const noData = ! hasWpcomFollowers && ! hasEmailFollowers;
	const hasError = hasEmailQueryFailed || hasWpcomQueryFailed;

	const summaryPageSlug = siteSlug || '';
	const useJetpackCloudLinks =
		isAtomic || isJetpack || ( isEnabled( 'jetpack/manage-simple-sites' ) && isAdminInterface );
	const subscriberManagementUrl = useJetpackCloudLinks
		? `https://cloud.jetpack.com/subscribers/${ summaryPageSlug }`
		: `https://wordpress.com/subscribers/${ summaryPageSlug }`;

	// Combine data sets, sort by recency, and limit to 10
	const data = [ ...( wpcomData?.subscribers ?? [] ), ...( emailData?.subscribers ?? [] ) ]
		.sort( ( a, b ) => {
			return new Date( b.value?.value || 0 ) - new Date( a.value?.value || 0 );
		} )
		.slice( 0, MAX_FOLLOWERS_TO_SHOW );

	return (
		<>
			{ siteId && (
				<QuerySiteStats statType="statsFollowers" siteId={ siteId } query={ wpcomQuery } />
			) }
			{ siteId && (
				<QuerySiteStats statType="statsFollowers" siteId={ siteId } query={ emailQuery } />
			) }
			<StatsListCard
				moduleType="followers"
				data={ data.map( ( dataPoint ) => ( {
					...dataPoint,
					value: calculateOffset( dataPoint.value?.value ),
				} ) ) }
				usePlainCard
				hasNoBackground
				title={ translate( 'Subscribers' ) }
				emptyMessage={ translate(
					'Once you get a few, {{link}}your subscribers{{/link}} will appear here.',
					{
						comment: '{{link}} links to support documentation.',
						components: {
							link: (
								<a
									target="_blank"
									rel="noreferrer"
									href={ localizeUrl( `${ SUBSCRIBERS_SUPPORT_URL }#subscriber-stats` ) }
								/>
							),
						},
						context: 'Stats: Info box label when the Subscribers module is empty',
					}
				) }
				mainItemLabel={ translate( 'Subscriber' ) }
				metricLabel={ translate( 'Since' ) }
				splitHeader
				showMore={ {
					url: subscriberManagementUrl,
					label: translate( 'Manage subscribers' ),
				} }
				error={
					noData &&
					! hasError &&
					! isLoading && (
						<ErrorPanel className="is-empty-message" message={ translate( 'No subscribers' ) } />
					)
				}
				loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
				className={ clsx( 'stats__modernised-followers', className ) }
				showLeftIcon
			/>
		</>
	);
};

export default StatModuleFollowers;
