import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { SUPPORT_URL, INSIGHTS_SUPPORT_URL } from 'calypso/my-sites/stats/const';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_EMAILS_SUMMARY,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STAT_TYPE_INSIGHTS_ALL_TIME_STATS,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_TIME,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_DAY,
	STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS,
	STAT_TYPE_TAGS,
	STAT_TYPE_COMMENTS,
} from '../constants';
import { trackStatsAnalyticsEvent } from '../utils';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';
import { Props } from './';

const trafficSupportLinkWithAnchor = ( anchor: string ) => {
	return (
		<a
			href={ localizeUrl( `${ SUPPORT_URL }#${ anchor }` ) }
			target="_blank"
			rel="noopenner noreferrer"
		/>
	);
};

const insightsSupportLinkWithAnchor = ( anchor: string ) => {
	return (
		<a
			href={ localizeUrl( `${ INSIGHTS_SUPPORT_URL }#${ anchor }` ) }
			target="_blank"
			rel="noopenner noreferrer"
		/>
	);
};

const utmLearnMoreLink = ( isOdysseyStats: boolean ) => {
	return isOdysseyStats ? (
		<a
			href="https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing"
			target="_blank"
			rel="noopenner noreferrer"
		/>
	) : (
		<InlineSupportLink supportContext="utm-upsell-overlay" showIcon={ false } />
	);
};

const useUpsellCopy = ( statType: string, isOdysseyStats: boolean ) => {
	const translate = useTranslate();
	switch ( statType ) {
		case STATS_FEATURE_DATE_CONTROL:
			return translate( 'Compare different time periods to analyze your site’s growth.' );
		case STATS_FEATURE_UTM_STATS:
			return translate(
				'Generate UTM parameters and track your campaign performance data. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: utmLearnMoreLink( isOdysseyStats ),
					},
				}
			);
		case STATS_TYPE_DEVICE_STATS:
			return translate( 'See which devices your visitors are using.' );
		case STAT_TYPE_TOP_POSTS:
			return translate( 'Track which {{link}}Posts and Pages{{/link}} receive the most views.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'posts-amp-pages' ),
				},
			} );
		case STAT_TYPE_REFERRERS:
			return translate(
				'Discover which websites are {{link}}referring visitors{{/link}} to your site.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'referrers' ),
					},
				}
			);
		case STAT_TYPE_COUNTRY_VIEWS:
			return translate( 'Upgrade to track visitors by {{link}}location{{/link}}.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'countries' ),
				},
			} );
		case STAT_TYPE_CLICKS:
			return translate( 'View the most clicked {{link}}external links{{/link}} on your site.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'clicks' ),
				},
			} );
		case STAT_TYPE_TOP_AUTHORS:
			return translate( 'See how much traffic each {{link}}author{{/link}} has generated.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'authors' ),
				},
			} );
		case STAT_TYPE_EMAILS_SUMMARY:
			return translate(
				'View information about {{link}}emails{{/link}} sent to your subscribers.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'emails' ),
					},
				}
			);
		case STAT_TYPE_SEARCH_TERMS:
			return translate( 'See {{link}}terms that visitors search{{/link}} to find your site.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'search-terms' ),
				},
			} );
		case STAT_TYPE_VIDEO_PLAYS:
			return translate( 'Engagement information on your most viewed {{link}}videos{{/link}}.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'videos' ),
				},
			} );
		case STAT_TYPE_INSIGHTS_ALL_TIME_STATS:
			return translate( 'All-time {{link}}website insights{{/link}}.', {
				components: {
					link: insightsSupportLinkWithAnchor( 'all-time-highlights' ),
				},
			} );
		case STAT_TYPE_INSIGHTS_MOST_POPULAR_TIME:
			return translate( 'Best day and hour to post.' );
		case STAT_TYPE_INSIGHTS_MOST_POPULAR_DAY:
			return translate( 'Most popular day this year.' );
		case STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS:
			return translate( 'All-time views.' );
		case STAT_TYPE_TAGS:
			return translate( 'Track the most viewed {{link}}tags & categories{{/link}}.', {
				components: {
					link: insightsSupportLinkWithAnchor( ':~:text=Tags%20,%20Categories' ),
				},
			} );
		case STAT_TYPE_COMMENTS:
			return translate( 'Top comments overview.' );
		default:
			return translate( 'Upgrade to unlock the feature' );
	}
};

const StatsCardUpsellJetpack: React.FC< Props > = ( { className, siteId, statType } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const copyText = useUpsellCopy( statType, isOdysseyStats );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const tracksEvent = `${ statType }_upgrade_clicked`;

	const onClick = () => {
		// We need to ensure we pass the irclick id for impact affiliate tracking if its set.
		const currentParams = new URLSearchParams( window.location.search );
		const queryParams = new URLSearchParams();

		queryParams.set( 'productType', 'commercial' );
		queryParams.set( 'from', `${ tracksEvent }` );
		if ( currentParams.has( 'irclickid' ) ) {
			queryParams.set( 'irclickid', currentParams.get( 'irclickid' ) || '' );
		}

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_${ tracksEvent }` );
		// publish new unified upgrade event
		trackStatsAnalyticsEvent( 'stats_upgrade_clicked', {
			type: statType,
		} );

		// redirect to the Purchase page
		setTimeout( () => page( `/stats/purchase/${ siteSlug }?${ queryParams.toString() }` ), 250 );
	};

	return (
		<StatsCardUpsellOverlay
			className={ className }
			onClick={ onClick }
			copyText={ copyText }
			buttonComponent={
				<Button
					className={ clsx( {
						[ 'jetpack-emerald-button' ]: ! isWPCOMSite,
					} ) }
					onClick={ onClick }
					primary
				>
					{ translate( 'Upgrade plan' ) }
				</Button>
			}
		/>
	);
};

export default StatsCardUpsellJetpack;
