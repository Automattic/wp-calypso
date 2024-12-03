export const STATS_PERIOD = {
	HOUR: 'hour',
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
	YEAR: 'year',
};

// statTypes referred from
// https://github.com/Automattic/wp-calypso/blob/trunk/packages/wpcom.js/src/lib/runtime/site.get.js
// stat features are newly defined in this file

export const STAT_TYPE_CATEGORIES_LIST = 'categoriesList';
export const STAT_TYPE_COMMENTS_LIST = 'commentsList';
export const STAT_TYPE_DOMAINS_LIST = 'domainsList';
export const STAT_TYPE_EMBEDS_LIST = 'embedsList';
export const STAT_TYPE_FOLLOWS_LIST = 'followsList';
export const STAT_TYPE_MEDIA_LIST = 'mediaList';
export const STAT_TYPE_PAGE_TEMPLATES = 'pageTemplates';
export const STAT_TYPE_PLUGINS_LIST = 'pluginsList';
export const STAT_TYPE_POSTS_LIST = 'postsList';
export const STAT_TYPE_POST_TYPES_LIST = 'postTypesList';
export const STAT_TYPE_SHORTCODES_LIST = 'shortcodesList';
export const STAT_TYPE_STATS = 'stats';
export const STAT_TYPE_CLICKS = 'statsClicks';
export const STAT_TYPE_COMMENT_FOLLOWERS = 'statsCommentFollowers';
export const STAT_TYPE_COMMENTS = 'statsComments';
export const STAT_TYPE_COUNTRY_VIEWS = 'statsCountryViews';
export const STAT_TYPE_FOLLOWERS = 'statsFollowers';
export const STAT_TYPE_INSIGHTS_ALL_TIME_STATS = 'statsInsightsAllTimeStats';
export const STAT_TYPE_INSIGHTS_MOST_POPULAR_TIME = 'statsInsightsMostPopularTime';
export const STAT_TYPE_INSIGHTS_MOST_POPULAR_DAY = 'statsInsightsMostPopularDay';
export const STAT_TYPE_INSIGHTS_ALL_TIME_INSIGHTS = 'statsInsightsAllTimeInsights';
export const STAT_TYPE_PUBLICIZE = 'statsPublicize';
export const STAT_TYPE_REFERRERS = 'statsReferrers';
export const STAT_TYPE_SEARCH_TERMS = 'statsSearchTerms';
export const STAT_TYPE_STREAK = 'statsStreak';
export const STAT_TYPE_SUMMARY = 'statsSummary';
export const STAT_TYPE_TAGS = 'statsTags';
export const STAT_TYPE_TOP_AUTHORS = 'statsTopAuthors';
export const STAT_TYPE_EMAILS_SUMMARY = 'statsEmailsSummary';
export const STAT_TYPE_TOP_POSTS = 'statsTopPosts';
export const STAT_TYPE_VIDEO_PLAYS = 'statsVideoPlays';
export const STAT_TYPE_VISITS = 'statsVisits';
export const STAT_TYPE_TAGS_LIST = 'tagsList';
export const STAT_TYPE_USERS_LIST = 'usersList';
export const STAT_TYPE_WPCOM_PLUGINS_LIST = 'wpcomPluginsList';
export const STATS_TYPE_DEVICE_STATS = 'stats_devices_module';

// stats feature are for more granular control, string value is based on component name
export const STATS_FEATURE_DATE_CONTROL = 'StatsDateControl';
export const STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS = 'StatsDateControl/last_7_days';
export const STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS = 'StatsDateControl/last_30_days';
export const STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS = 'StatsDateControl/last_3_months';
export const STATS_FEATURE_DATE_CONTROL_LAST_YEAR = 'StatsDateControl/last_year';
export const STATS_FEATURE_INTERVAL_DROPDOWN = 'StatsIntervalDropdown';
export const STATS_FEATURE_INTERVAL_DROPDOWN_HOUR = `StatsIntervalDropdown/${ STATS_PERIOD.HOUR }`;
export const STATS_FEATURE_INTERVAL_DROPDOWN_DAY = `StatsIntervalDropdown/${ STATS_PERIOD.DAY }`;
export const STATS_FEATURE_INTERVAL_DROPDOWN_WEEK = `StatsIntervalDropdown/${ STATS_PERIOD.WEEK }`;
export const STATS_FEATURE_INTERVAL_DROPDOWN_MONTH = `StatsIntervalDropdown/${ STATS_PERIOD.MONTH }`;
export const STATS_FEATURE_INTERVAL_DROPDOWN_YEAR = `StatsIntervalDropdown/${ STATS_PERIOD.YEAR }`;
export const STATS_FEATURE_DOWNLOAD_CSV = 'StatsDownloadCsv';
export const STATS_FEATURE_PAGE_TRAFFIC = 'StatsPageTraffic';
export const STATS_FEATURE_PAGE_INSIGHTS = 'StatsPageInsights';
export const STATS_FEATURE_SUMMARY_LINKS = 'StatsModuleSummaryLinks';
export const STATS_FEATURE_SUMMARY_LINKS_DAY = 'StatsModuleSummaryLinks/day';
export const STATS_FEATURE_SUMMARY_LINKS_7_DAYS = 'StatsModuleSummaryLinks/7_days';
export const STATS_FEATURE_SUMMARY_LINKS_30_DAYS = 'StatsModuleSummaryLinks/30_days';
export const STATS_FEATURE_SUMMARY_LINKS_QUARTER = 'StatsModuleSummaryLinks/quarter';
export const STATS_FEATURE_SUMMARY_LINKS_YEAR = 'StatsModuleSummaryLinks/year';
export const STATS_FEATURE_SUMMARY_LINKS_ALL = 'StatsModuleSummaryLinks/all';
// UTM Stats which is already in use, so didn't align with the naming convertion.
export const STATS_FEATURE_UTM_STATS = 'stats_utm';

// other
export const STATS_DO_YOU_LOVE_JETPACK_STATS_NOTICE = 'DoYouLoveJetpackStatsNotice';

export const DATE_FORMAT = 'YYYY-MM-DD';
