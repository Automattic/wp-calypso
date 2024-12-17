import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { SUPPORT_URL, INSIGHTS_SUPPORT_URL } from 'calypso/my-sites/stats/const';
import {
	STATS_FEATURE_DATE_CONTROL,
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
						link: trafficSupportLinkWithAnchor( 'clicks' ),
					},
				}
			);
		case STAT_TYPE_COUNTRY_VIEWS:
			return translate(
				'Discover where your {{link}}visitors are located{{/link}} and identify where your traffic is coming from.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'countries' ),
					},
				}
			);
		case STAT_TYPE_FILE_DOWNLOADS:
			return translate( 'Discover the most {{link}}downloaded files{{/link}} by your visitors.', {
				components: {
					link: (
						<a
							href={ localizeUrl( `${ SUPPORT_URL }#file-downloads` ) }
							target="_blank"
							rel="noreferrer"
						/>
					),
				},
			} );
		case STAT_TYPE_REFERRERS:
			return translate(
				'Find out where your {{link}}visitors come from{{/link}} to optimize your content strategy.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'referrers' ),
					},
				}
			);
		case STAT_TYPE_SEARCH_TERMS:
			return translate(
				'Discover the {{link}}terms and phrases{{/link}} your visitors use to find your site.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'search-terms' ),
					},
				}
			);
		case STAT_TYPE_TOP_AUTHORS:
			return translate(
				'Identify your audience’s {{link}}favorite writers{{/link}} and perspectives.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'authors' ),
					},
				}
			);
		case STAT_TYPE_TOP_POSTS:
			return translate(
				'Discover your {{link}}post and pages{{/link}} traffic in detail and learn what content resonates the most.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'posts-amp-pages' ),
					},
				}
			);
		case STAT_TYPE_VIDEO_PLAYS:
			return translate(
				'Discover your {{link}}most popular videos{{/link}} and find out how they performed.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'videos' ),
					},
				}
			);
		case STATS_FEATURE_DATE_CONTROL:
			return translate( 'Compare different time periods to analyze your site’s growth.' );
		case STATS_FEATURE_UTM_STATS:
			return translate(
				'Generate UTM parameters and track your {{link}}campaign performance data{{/link}}.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'utm' ),
					},
				}
			);
		case STATS_TYPE_DEVICE_STATS:
			return translate(
				'See which {{link}}devices, browsers and OS{{/link}} your visitors are using.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'devices' ),
					},
				}
			);
		case STAT_TYPE_EMAILS_SUMMARY:
			return translate(
				'View information about {{link}}emails{{/link}} sent to your subscribers.',
				{
					components: {
						link: trafficSupportLinkWithAnchor( 'emails' ),
					},
				}
			);
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
			return translate( 'Upgrade your plan to unlock Jetpack Stats.' );
	}
};

export default getUpsellCopy;
