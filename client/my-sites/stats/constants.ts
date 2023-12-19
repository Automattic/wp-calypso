// statTypes referred from
// https://github.com/Automattic/wp-calypso/blob/trunk/packages/wpcom.js/src/lib/runtime/site.get.js
// subTypes are newly defined in this file, based on component names

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
export const STAT_TYPE_STATS_CLICKS = 'statsClicks';
export const STAT_TYPE_STATS_COMMENT_FOLLOWERS = 'statsCommentFollowers';
export const STAT_TYPE_STATS_COMMENTS = 'statsComments';
export const STAT_TYPE_STATS_COUNTRY_VIEWS = 'statsCountryViews';
export const STAT_TYPE_STATS_FOLLOWERS = 'statsFollowers';
export const STAT_TYPE_STATS_INSIGHTS = 'statsInsights';
export const STAT_TYPE_STATS_PUBLICIZE = 'statsPublicize';
export const STAT_TYPE_STATS_REFERRERS = 'statsReferrers';
export const STAT_TYPE_STATS_SEARCH_TERMS = 'statsSearchTerms';
export const STAT_TYPE_STATS_STREAK = 'statsStreak';
export const STAT_TYPE_STATS_SUMMARY = 'statsSummary';
export const STAT_TYPE_STATS_TAGS = 'statsTags';
export const STAT_TYPE_STATS_TOP_AUTHORS = 'statsTopAuthors';
export const STAT_TYPE_STATS_TOP_POSTS = 'statsTopPosts';
export const STAT_TYPE_STATS_VIDEO_PLAYS = 'statsVideoPlays';
export const STAT_TYPE_STATS_VISITS = 'statsVisits';
export const STAT_TYPE_TAGS_LIST = 'tagsList';
export const STAT_TYPE_USERS_LIST = 'usersList';
export const STAT_TYPE_WPCOM_PLUGINS_LIST = 'wpcomPluginsList';

// Subtypes are for more granular control
export const STATS_FEATURE_DATE_CONTROL = 'StatsDateControl';
export const STATS_FEATURE_DOWNLOAD_CSV = 'StatsDownloadCsv';
