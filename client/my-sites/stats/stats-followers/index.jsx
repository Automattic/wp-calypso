import config, { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
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

class StatModuleFollowers extends Component {
	state = {
		activeFilter: 'wpcom-followers',
	};

	calculateOffset( pastValue ) {
		const { translate } = this.props;

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
	}

	render() {
		const {
			siteId,
			siteSlug,
			wpcomData,
			emailData,
			requestingWpcomFollowers,
			requestingEmailFollowers,
			hasEmailQueryFailed,
			hasWpcomQueryFailed,
			translate,
			emailQuery,
			wpcomQuery,
			isAtomic,
			isJetpack,
			className,
			isAdminInterface,
		} = this.props;
		const isLoading = requestingWpcomFollowers || requestingEmailFollowers;
		const hasEmailFollowers = !! get( emailData, 'subscribers', [] ).length;
		const hasWpcomFollowers = !! get( wpcomData, 'subscribers', [] ).length;
		const noData = ! hasWpcomFollowers && ! hasEmailFollowers;
		const hasError = hasEmailQueryFailed || hasWpcomQueryFailed;

		const summaryPageSlug = siteSlug || '';
		// email-followers is no longer available, so fallback to the new subscribers URL.
		// Old, non-functional path: '/people/email-followers/' + summaryPageSlug.
		// If the site is Atomic, Simple Classic or Jetpack self-hosted, it links to Jetpack Cloud.
		// jetpack/manage-simple-sites is the feature flag for allowing Simple sites in Jetpack Cloud.
		const useJetpackCloudLinks =
			isAtomic || isJetpack || ( isEnabled( 'jetpack/manage-simple-sites' ) && isAdminInterface );
		const subscriberManagementUrl = useJetpackCloudLinks
			? `https://cloud.jetpack.com/subscribers/${ summaryPageSlug }`
			: `https://wordpress.com/subscribers/${ summaryPageSlug }`;

		// Combine data sets, sort by recency, and limit to 10.
		const data = [ ...( wpcomData?.subscribers ?? [] ), ...( emailData?.subscribers ?? [] ) ]
			.sort( ( a, b ) => {
				// If value is undefined, send zero to ensure they sort to the bottom.
				// Otherwise they stick to the top of the list which is not helpful.
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
						value: this.calculateOffset( dataPoint.value?.value ), // case 'relative-date': value = this.props.moment( valueData.value ).fromNow( true );
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
						label: this.props.translate( 'Manage subscribers' ),
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
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const emailQuery = { type: 'email', max: 10 };
		const wpcomQuery = { type: 'wpcom', max: 10 };

		return {
			requestingEmailFollowers: isRequestingSiteStatsForQuery(
				state,
				siteId,
				'statsFollowers',
				emailQuery
			),
			emailData: getSiteStatsNormalizedData( state, siteId, 'statsFollowers', emailQuery ),
			hasEmailQueryFailed: hasSiteStatsQueryFailed( state, siteId, 'statsFollowers', emailQuery ),
			requestingWpcomFollowers: isRequestingSiteStatsForQuery(
				state,
				siteId,
				'statsFollowers',
				wpcomQuery
			),
			wpcomData: getSiteStatsNormalizedData( state, siteId, 'statsFollowers', wpcomQuery ),
			hasWpcomQueryFailed: hasSiteStatsQueryFailed( state, siteId, 'statsFollowers', wpcomQuery ),
			emailQuery,
			wpcomQuery,
			siteId,
			siteSlug,
			isOdysseyStats: config.isEnabled( 'is_running_in_jetpack_site' ),
			isAtomic: isAtomicSite( state, siteId ),
			isJetpack: isJetpackSite( state, siteId ),
			isAdminInterface: isAdminInterfaceWPAdmin( state, siteId ),
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatModuleFollowers );
