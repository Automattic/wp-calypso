import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import {
	SUPPORT_URL,
	INSIGHTS_SUPPORT_URL,
	JETPACK_SUPPORT_URL_TRAFFIC,
	JETPACK_SUPPORT_VIDEOPRESS_URL_STATS,
} from 'calypso/my-sites/stats/const';
import {
	STATS_PRODUCT_NAME,
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_FILE_DOWNLOADS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_VIDEO_PLAYS,
	STAT_TYPE_EMAILS_SUMMARY,
	STAT_TYPE_INSIGHTS_ALL_TIME_STATS,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_TIME,
	STAT_TYPE_INSIGHTS_MOST_POPULAR_DAY,
	STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS,
	STAT_TYPE_TAGS,
	STAT_TYPE_COMMENTS,
} from '../constants';

const jetpackTrafficSupportLinkWithAnchor = ( anchor: string ) => {
	return (
		<a
			href={ localizeUrl( `${ JETPACK_SUPPORT_URL_TRAFFIC }#${ anchor }` ) }
			target="_blank"
			rel="noopenner noreferrer"
		/>
	);
};

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

const getUpsellCopy = ( statType: string ) => {
	switch ( statType ) {
		case STAT_TYPE_CLICKS:
			return translate(
				'Learn what {{link}}external links{{/link}} your visitors click on your site to reveal their areas of interest.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'clicks' ),
					},
				}
			);
		case STAT_TYPE_COUNTRY_VIEWS:
			return translate(
				'Discover where your {{link}}visitors are located{{/link}} and identify where your traffic is coming from.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'countries' ),
					},
				}
			);
		case STATS_FEATURE_LOCATION_REGION_VIEWS:
		case STATS_FEATURE_LOCATION_CITY_VIEWS:
			// TODO: Add link to proper support page
			return translate(
				'Access to visitor stats at the {{link}}regional and city{{/link}} level for more accurate analysis.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'countries' ),
					},
				}
			);
		case STAT_TYPE_FILE_DOWNLOADS:
			return translate( 'Discover the most {{link}}downloaded files{{/link}} by your visitors.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'file-downloads' ),
				},
			} );
		case STAT_TYPE_REFERRERS:
			return translate(
				'Find out where your {{link}}visitors come from{{/link}} to optimize your content strategy.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'referrers' ),
					},
				}
			);
		case STAT_TYPE_SEARCH_TERMS:
			return translate(
				'Discover the {{link}}terms and phrases{{/link}} your visitors use to find your site.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'search-terms' ),
					},
				}
			);
		case STAT_TYPE_TOP_AUTHORS:
			return translate(
				'Identify your audience’s {{link}}favorite writers{{/link}} and perspectives.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'authors' ),
					},
				}
			);
		case STAT_TYPE_TOP_POSTS:
			return translate(
				'Discover your {{link}}post and pages{{/link}} traffic in detail and learn what content resonates the most.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'analyzing-popular-posts-and-pages' ),
					},
				}
			);
		case STAT_TYPE_VIDEO_PLAYS:
			return translate(
				'Discover your {{link}}most popular videos{{/link}} and find out how they performed.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( JETPACK_SUPPORT_VIDEOPRESS_URL_STATS ) }
								target="_blank"
								rel="noopenner noreferrer"
							/>
						),
					},
				}
			);
		case STATS_FEATURE_DATE_CONTROL:
			return translate(
				'Compare different {{link}}time periods{{/link}} to analyze your site’s growth.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'using-date-filters' ),
					},
				}
			);
		case STATS_FEATURE_UTM_STATS:
			return translate(
				'Generate UTM parameters and track your {{link}}campaign performance data{{/link}}.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor(
							'harnessing-utm-stats-for-precision-tracking'
						),
					},
				}
			);
		case STATS_TYPE_DEVICE_STATS:
			return translate(
				'See which {{link}}devices, browsers and OS{{/link}} your visitors are using.',
				{
					components: {
						link: jetpackTrafficSupportLinkWithAnchor( 'devices-stats' ),
					},
				}
			);
		case STAT_TYPE_EMAILS_SUMMARY:
			return translate( 'Learn about the performance of the emails you sent to your subscribers.', {
				components: {
					link: trafficSupportLinkWithAnchor( 'emails' ),
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
			return translate( 'Upgrade your plan to unlock %(product)s.', {
				args: { product: STATS_PRODUCT_NAME },
			} ) as string;
	}
};

export default getUpsellCopy;
