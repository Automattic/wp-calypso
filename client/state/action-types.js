/** @ssr-ready **/

/**
 * Any new action type should be added to the set of exports below, with the
 * value mirroring its exported name.
 *
 * Please keep this list alphabetized!
 *
 * Unsure how to name an action type? Refer to our guidelines:
 *  - https://wpcalypso.wordpress.com/devdocs/docs/our-approach-to-data.md#actions
 */

export const ANALYTICS_EVENT_RECORD = 'ANALYTICS_EVENT_RECORD';
export const ANALYTICS_MULTI_TRACK = 'ANALYTICS_MULTI_TRACK';
export const ANALYTICS_PAGE_VIEW_RECORD = 'ANALYTICS_PAGE_VIEW_RECORD';
export const ANALYTICS_STAT_BUMP = 'ANALYTICS_STAT_BUMP';
export const CONNECTION_LOST = 'CONNECTION_LOST';
export const CONNECTION_RESTORED = 'CONNECTION_RESTORED';
export const COMMENTS_COUNT_RECEIVE = 'COMMENTS_COUNT_RECEIVE';
export const COMMENTS_ERROR = 'COMMENTS_ERROR';
export const COMMENTS_LIKE = 'COMMENTS_LIKE';
export const COMMENTS_LIKE_UPDATE = 'COMMENTS_LIKE_UPDATE';
export const COMMENTS_RECEIVE = 'COMMENTS_RECEIVE';
export const COMMENTS_REMOVE = 'COMMENTS_REMOVE';
export const COMMENTS_REQUEST = 'COMMENTS_REQUEST';
export const COMMENTS_REQUEST_SUCCESS = 'COMMENTS_REQUEST_SUCCESS';
export const COMMENTS_REQUEST_FAILURE = 'COMMENTS_REQUEST_FAILURE';
export const COMMENTS_UNLIKE = 'COMMENTS_UNLIKE';
export const DOCUMENT_HEAD_LINK_ADD = 'DOCUMENT_HEAD_LINK_ADD';
export const DOCUMENT_HEAD_META_ADD = 'DOCUMENT_HEAD_META_ADD';
export const DOCUMENT_HEAD_TITLE_SET = 'DOCUMENT_HEAD_TITLE_SET';
export const DOCUMENT_HEAD_UNREAD_COUNT_SET = 'DOCUMENT_HEAD_UNREAD_COUNT_SET';
export const CURRENT_USER_ID_SET = 'CURRENT_USER_ID_SET';
export const DESERIALIZE = 'DESERIALIZE';
export const DOMAINS_SUGGESTIONS_RECEIVE = 'DOMAINS_SUGGESTIONS_RECEIVE';
export const DOMAINS_SUGGESTIONS_REQUEST = 'DOMAINS_SUGGESTIONS_REQUEST';
export const DOMAINS_SUGGESTIONS_REQUEST_FAILURE = 'DOMAINS_SUGGESTIONS_REQUEST_FAILURE';
export const DOMAINS_SUGGESTIONS_REQUEST_SUCCESS = 'DOMAINS_SUGGESTIONS_REQUEST_SUCCESS';
export const EDITOR_CONTACT_FORM_CLEAR = 'EDITOR_CONTACT_FORM_CLEAR';
export const EDITOR_CONTACT_FORM_LOAD = 'EDITOR_CONTACT_FORM_LOAD';
export const EDITOR_CONTACT_FORM_FIELD_ADD = 'EDITOR_CONTACT_FORM_FIELD_ADD';
export const EDITOR_CONTACT_FORM_FIELD_REMOVE = 'EDITOR_CONTACT_FORM_FIELD_REMOVE';
export const EDITOR_CONTACT_FORM_FIELD_UPDATE = 'EDITOR_CONTACT_FORM_FIELD_UPDATE';
export const EDITOR_CONTACT_FORM_SETTINGS_UPDATE = 'EDITOR_CONTACT_FORM_SETTINGS_UPDATE';
export const EDITOR_LAST_DRAFT_SET = 'EDITOR_LAST_DRAFT_SET';
export const EDITOR_MEDIA_EDIT_ITEM_SET = 'EDITOR_MEDIA_EDIT_ITEM_SET';
export const EDITOR_POST_ID_SET = 'EDITOR_POST_ID_SET';
export const EDITOR_SHOW_DRAFTS_TOGGLE = 'EDITOR_SHOW_DRAFTS_TOGGLE';
export const EXPORT_ADVANCED_SETTINGS_FETCH = 'EXPORT_ADVANCED_SETTINGS_FETCH';
export const EXPORT_ADVANCED_SETTINGS_FETCH_FAIL = 'EXPORT_ADVANCED_SETTINGS_FETCH_FAIL';
export const EXPORT_ADVANCED_SETTINGS_RECEIVE = 'EXPORT_ADVANCED_SETTINGS_RECEIVE';
export const EXPORT_CLEAR = 'EXPORT_CLEAR';
export const EXPORT_COMPLETE = 'EXPORT_COMPLETE';
export const EXPORT_FAILURE = 'EXPORT_FAILURE';
export const EXPORT_START_REQUEST = 'EXPORT_START_REQUEST';
export const EXPORT_STARTED = 'EXPORT_STARTED';
export const EXPORT_STATUS_FETCH = 'EXPORT_STATUS_FETCH';
export const FETCH_WPORG_PLUGIN_DATA = 'FETCH_WPORG_PLUGIN_DATA';
export const GOOGLE_APPS_USERS_FETCH = 'GOOGLE_APPS_USERS_FETCH';
export const GOOGLE_APPS_USERS_FETCH_COMPLETED = 'GOOGLE_APPS_USERS_FETCH_COMPLETED';
export const GOOGLE_APPS_USERS_FETCH_FAILED = 'GOOGLE_APPS_USERS_FETCH_FAILED';
export const IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE = 'IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE';
export const IMAGE_EDITOR_FLIP = 'IMAGE_EDITOR_FLIP';
export const IMAGE_EDITOR_SET_FILE_INFO = 'IMAGE_EDITOR_SET_FILE_INFO';
export const IMAGE_EDITOR_STATE_RESET = 'IMAGE_EDITOR_STATE_RESET';
export const IMPORTS_AUTHORS_SET_MAPPING = 'IMPORTS_AUTHORS_SET_MAPPING';
export const IMPORTS_AUTHORS_START_MAPPING = 'IMPORTS_AUTHORS_START_MAPPING';
export const IMPORTS_FETCH = 'IMPORTS_FETCH';
export const IMPORTS_FETCH_FAILED = 'IMPORTS_FETCH_FAILED';
export const IMPORTS_FETCH_COMPLETED = 'IMPORTS_FETCH_COMPLETED';
export const IMPORTS_IMPORT_CANCEL = 'IMPORTS_IMPORT_CANCEL';
export const IMPORTS_IMPORT_LOCK = 'IMPORTS_IMPORT_LOCK';
export const IMPORTS_IMPORT_RECEIVE = 'IMPORTS_IMPORT_RECEIVE';
export const IMPORTS_IMPORT_RESET = 'IMPORTS_IMPORT_RESET';
export const IMPORTS_IMPORT_START = 'IMPORTS_IMPORT_START';
export const IMPORTS_IMPORT_UNLOCK = 'IMPORTS_IMPORT_UNLOCK';
export const IMPORTS_START_IMPORTING = 'IMPORTS_START_IMPORTING';
export const IMPORTS_STORE_RESET = 'IMPORTS_STORE_RESET';
export const IMPORTS_UPLOAD_FAILED = 'IMPORTS_UPDLOAD_FAILED';
export const IMPORTS_UPLOAD_COMPLETED = 'IMPORTS_UPLOAD_COMPLETED';
export const IMPORTS_UPLOAD_SET_PROGRESS = 'IMPORTS_UPLOAD_SET_PROGRESS';
export const IMPORTS_UPLOAD_START = 'IMPORTS_UPLOAD_START';
export const JETPACK_CONNECT_CHECK_URL = 'JETPACK_CONNECT_CHECK_URL';
export const JETPACK_CONNECT_CHECK_URL_RECEIVE = 'JETPACK_CONNECT_CHECK_URL_RECEIVE';
export const JETPACK_CONNECT_DISMISS_URL_STATUS = 'JETPACK_CONNECT_DISMISS_URL_STATUS';
export const JETPACK_CONNECT_AUTHORIZE = 'JETPACK_CONNECT_AUTHORIZE';
export const JETPACK_CONNECT_AUTHORIZE_RECEIVE = 'JETPACK_CONNECT_AUTHORIZE_RECEIVE';
export const JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST = 'JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST';
export const JETPACK_CONNECT_QUERY_SET = 'JETPACK_CONNECT_QUERY_SET';
export const JETPACK_CONNECT_QUERY_UPDATE = 'JETPACK_CONNECT_QUERY_UPDATE';
export const JETPACK_CONNECT_CREATE_ACCOUNT = 'JETPACK_CONNECT_CREATE_ACCOUNT';
export const JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE = 'JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE';
export const JETPACK_CONNECT_ACTIVATE_MANAGE = 'JETPACK_CONNECT_ACTIVATE_MANAGE';
export const JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE = 'JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE';
export const JETPACK_CONNECT_REDIRECT = 'JETPACK_CONNECT_REDIRECT';
export const JETPACK_CONNECT_REDIRECT_WP_ADMIN = 'JETPACK_CONNECT_REDIRECT_WP_ADMIN';
export const JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST = 'JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST';
export const JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS = 'JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS';
export const JETPACK_CONNECT_SSO_AUTHORIZE_ERROR = 'JETPACK_CONNECT_SSO_AUTHORIZE_ERROR';
export const JETPACK_CONNECT_SSO_QUERY_SET = 'JETPACK_CONNECT_SSO_QUERY_SET';
export const JETPACK_CONNECT_SSO_VALIDATION_REQUEST = 'JETPACK_CONNECT_SSO_VALIDATION_REQUEST';
export const JETPACK_CONNECT_SSO_VALIDATION_SUCCESS = 'JETPACK_CONNECT_SSO_VALIDATION_SUCCESS';
export const JETPACK_CONNECT_SSO_VALIDATION_ERROR = 'JETPACK_CONNECT_SSO_VALIDATION_ERROR';
export const JETPACK_CONNECT_STORE_SESSION = 'JETPACK_CONNECT_STORE_SESSION';
export const NEW_NOTICE = 'NEW_NOTICE';
export const PLUGIN_SETUP_INSTRUCTIONS_FETCH = 'PLUGIN_SETUP_INSTRUCTIONS_FETCH';
export const PLUGIN_SETUP_INSTRUCTIONS_RECEIVE = 'PLUGIN_SETUP_INSTRUCTIONS_RECEIVE';
export const PLUGIN_SETUP_INSTALL = 'PLUGIN_SETUP_INSTALL';
export const PLUGIN_SETUP_ACTIVATE = 'PLUGIN_SETUP_ACTIVATE';
export const PLUGIN_SETUP_CONFIGURE = 'PLUGIN_SETUP_CONFIGURE';
export const PLUGIN_SETUP_FINISH = 'PLUGIN_SETUP_FINISH';
export const PLUGIN_SETUP_ERROR = 'PLUGIN_SETUP_ERROR';
export const PLANS_RECEIVE = 'PLANS_RECEIVE';
export const PLANS_REQUEST = 'PLANS_REQUEST';
export const PLANS_REQUEST_SUCCESS = 'PLANS_REQUEST_SUCCESS';
export const PLANS_REQUEST_FAILURE = 'PLANS_REQUEST_FAILURE';
export const POST_COUNTS_RECEIVE = 'POST_COUNTS_RECEIVE';
export const POST_COUNTS_REQUEST = 'POST_COUNTS_REQUEST';
export const POST_COUNTS_REQUEST_FAILURE = 'POST_COUNTS_REQUEST_FAILURE';
export const POST_COUNTS_REQUEST_SUCCESS = 'POST_COUNTS_REQUEST_SUCCESS';
export const PREVIEW_CUSTOMIZATIONS_CLEAR = 'PREVIEW_CUSTOMIZATIONS_CLEAR';
export const PREVIEW_MARKUP_RECEIVE = 'PREVIEW_MARKUP_RECEIVE';
export const PREVIEW_CUSTOMIZATIONS_SAVED = 'PREVIEW_CUSTOMIZATIONS_SAVED';
export const PREVIEW_CUSTOMIZATIONS_UPDATE = 'PREVIEW_CUSTOMIZATIONS_UPDATE';
export const PREVIEW_CUSTOMIZATIONS_UNDO = 'PREVIEW_CUSTOMIZATIONS_UNDO';
export const POST_EDIT = 'POST_EDIT';
export const POST_EDITS_RESET = 'POST_EDITS_RESET';
export const POST_REQUEST = 'POST_REQUEST';
export const POST_REQUEST_SUCCESS = 'POST_REQUEST_SUCCESS';
export const POST_REQUEST_FAILURE = 'POST_REQUEST_FAILURE';
export const POST_STATS_RECEIVE = 'POST_STATS_RECEIVE';
export const POST_STATS_REQUEST = 'POST_STATS_REQUEST';
export const POST_STATS_REQUEST_FAILURE = 'POST_STATS_REQUEST_FAILURE';
export const POST_STATS_REQUEST_SUCCESS = 'POST_STATS_REQUEST_SUCCESS';
export const POST_TYPES_RECEIVE = 'POST_TYPES_RECEIVE';
export const POST_TYPES_REQUEST = 'POST_TYPES_REQUEST';
export const POST_TYPES_REQUEST_SUCCESS = 'POST_TYPES_REQUEST_SUCCESS';
export const POST_TYPES_REQUEST_FAILURE = 'POST_TYPES_REQUEST_FAILURE';
export const POST_TYPES_TAXONOMIES_RECEIVE = 'POST_TYPES_TAXONOMIES_RECEIVE';
export const POST_TYPES_TAXONOMIES_REQUEST = 'POST_TYPES_TAXONOMIES_REQUEST';
export const POST_TYPES_TAXONOMIES_REQUEST_FAILURE = 'POST_TYPES_TAXONOMIES_REQUEST_FAILURE';
export const POST_TYPES_TAXONOMIES_REQUEST_SUCCESS = 'POST_TYPES_TAXONOMIES_REQUEST_SUCCESS';
export const POSTS_RECEIVE = 'POSTS_RECEIVE';
export const POSTS_REQUEST = 'POSTS_REQUEST';
export const POSTS_REQUEST_FAILURE = 'POSTS_REQUEST_FAILURE';
export const POSTS_REQUEST_SUCCESS = 'POSTS_REQUEST_SUCCESS';
export const PUBLICIZE_CONNECTIONS_RECEIVE = 'PUBLICIZE_CONNECTIONS_RECEIVE';
export const PUBLICIZE_CONNECTIONS_REQUEST = 'PUBLICIZE_CONNECTIONS_REQUEST';
export const PUBLICIZE_CONNECTIONS_REQUEST_FAILURE = 'PUBLICIZE_CONNECTIONS_REQUEST_FAILURE';
export const READER_FULLPOST_SHOW = 'READER_FULLPOST_SHOW';
export const READER_FULLPOST_HIDE = 'READER_FULLPOST_HIDE';
export const READER_LIST_DISMISS_NOTICE = 'READER_LIST_DISMISS_NOTICE';
export const READER_LIST_REQUEST = 'READER_LIST_REQUEST';
export const READER_LIST_REQUEST_SUCCESS = 'READER_LIST_REQUEST_SUCCESS';
export const READER_LIST_REQUEST_FAILURE = 'READER_LIST_REQUEST_FAILURE';
export const READER_LIST_UPDATE = 'READER_LIST_UPDATE';
export const READER_LIST_UPDATE_SUCCESS = 'READER_LIST_UPDATE_SUCCESS';
export const READER_LIST_UPDATE_FAILURE = 'READER_LIST_UPDATE_FAILURE';
export const READER_LIST_UPDATE_TITLE = 'READER_LIST_UPDATE_TITLE';
export const READER_LIST_UPDATE_DESCRIPTION = 'READER_LIST_UPDATE_DESCRIPTION';
export const READER_LISTS_FOLLOW = 'READER_LISTS_FOLLOW';
export const READER_LISTS_FOLLOW_SUCCESS = 'READER_LISTS_FOLLOW_SUCCESS';
export const READER_LISTS_FOLLOW_FAILURE = 'READER_LISTS_FOLLOW_FAILURE';
export const READER_LISTS_RECEIVE = 'READER_LISTS_RECEIVE';
export const READER_LISTS_REQUEST = 'READER_LISTS_REQUEST';
export const READER_LISTS_REQUEST_SUCCESS = 'READER_LISTS_REQUEST_SUCCESS';
export const READER_LISTS_REQUEST_FAILURE = 'READER_LISTS_REQUEST_FAILURE';
export const READER_LISTS_UNFOLLOW = 'READER_LISTS_UNFOLLOW';
export const READER_LISTS_UNFOLLOW_SUCCESS = 'READER_LISTS_UNFOLLOW_SUCCESS';
export const READER_LISTS_UNFOLLOW_FAILURE = 'READER_LISTS_UNFOLLOW_FAILURE';
export const READER_SIDEBAR_LISTS_TOGGLE = 'READER_SIDEBAR_LISTS_TOGGLE';
export const READER_SIDEBAR_TAGS_TOGGLE = 'READER_SIDEBAR_TAGS_TOGGLE';
export const RECEIPT_FETCH = 'RECEIPT_FETCH';
export const RECEIPT_FETCH_COMPLETED = 'RECEIPT_FETCH_COMPLETED';
export const RECEIPT_FETCH_FAILED = 'RECEIPT_FETCH_FAILED';
export const REMOVE_NOTICE = 'REMOVE_NOTICE';
export const SELECTED_SITE_SET = 'SELECTED_SITE_SET';
export const SERIALIZE = 'SERIALIZE';
export const SERVER_DESERIALIZE = 'SERVER_DESERIALIZE';
export const SET_EXPORT_POST_TYPE = 'SET_EXPORT_POST_TYPE';
export const SET_ROUTE = 'SET_ROUTE';
export const SET_SECTION = 'SET_SECTION';
export const GUIDED_TOUR_SHOW = 'GUIDED_TOUR_SHOW';
export const GUIDED_TOUR_UPDATE = 'GUIDED_TOUR_UPDATE';
export const SITE_DOMAINS_RECEIVE = 'SITE_DOMAINS_RECEIVE';
export const SITE_DOMAINS_REQUEST = 'SITE_DOMAINS_REQUEST';
export const SITE_DOMAINS_REQUEST_SUCCESS = 'SITE_DOMAINS_REQUEST_SUCCESS';
export const SITE_DOMAINS_REQUEST_FAILURE = 'SITE_DOMAINS_REQUEST_FAILURE';
export const SITE_MEDIA_STORAGE_RECEIVE = 'SITE_MEDIA_STORAGE_RECEIVE';
export const SITE_MEDIA_STORAGE_REQUEST = 'SITE_MEDIA_STORAGE_REQUEST';
export const SITE_MEDIA_STORAGE_REQUEST_SUCCESS = 'SITE_MEDIA_STORAGE_REQUEST_SUCCESS';
export const SITE_MEDIA_STORAGE_REQUEST_FAILURE = 'SITE_MEDIA_STORAGE_REQUEST_FAILURE';
export const SITE_PLANS_FETCH = 'SITE_PLANS_FETCH';
export const SITE_PLANS_FETCH_COMPLETED = 'SITE_PLANS_FETCH_COMPLETED';
export const SITE_PLANS_FETCH_FAILED = 'SITE_PLANS_FETCH_FAILED';
export const SITE_PLANS_REMOVE = 'SITE_PLANS_REMOVE';
export const SITE_PLANS_TRIAL_CANCEL = 'SITE_PLANS_TRIAL_CANCEL';
export const SITE_PLANS_TRIAL_CANCEL_COMPLETED = 'SITE_PLANS_TRIAL_CANCEL_COMPLETED';
export const SITE_PLANS_TRIAL_CANCEL_FAILED = 'SITE_PLANS_TRIAL_CANCEL_FAILED';
export const SITE_RECEIVE = 'SITE_RECEIVE';
export const SITES_RECEIVE = 'SITES_RECEIVE';
export const SITES_REQUEST = 'SITES_REQUEST';
export const SITES_REQUEST_FAILURE = 'SITES_REQUEST_FAILURE';
export const SITES_REQUEST_SUCCESS = 'SITES_REQUEST_SUCCESS';
export const SUPPORT_USER_ACTIVATE = 'SUPPORT_USER_ACTIVATE';
export const SUPPORT_USER_ERROR = 'SUPPORT_USER_ERROR';
export const SUPPORT_USER_TOGGLE_DIALOG = 'SUPPORT_USER_TOGGLE_DIALOG';
export const SUPPORT_USER_TOKEN_FETCH = 'SUPPORT_USER_TOKEN_FETCH';
export const TERMS_RECEIVE = 'TERMS_RECEIVE';
export const TERMS_REQUEST = 'TERMS_REQUEST';
export const TERMS_REQUEST_FAILURE = 'TERMS_REQUEST_FAILURE';
export const TERMS_REQUEST_SUCCESS = 'TERMS_REQUEST_SUCCESS';
export const THEME_ACTIVATE = 'THEME_ACTIVATE';
export const THEME_ACTIVATED = 'THEME_ACTIVATED';
export const THEME_CLEAR_ACTIVATED = 'THEME_CLEAR_ACTIVATED';
export const THEME_CUSTOMIZE = 'THEME_CUSTOMIZE';
export const THEME_DETAILS_RECEIVE = 'THEME_DETAILS_RECEIVE';
export const THEME_PURCHASE = 'THEME_PURCHASE';
export const THEME_RECEIVE_CURRENT = 'THEMES_RECEIVE_CURRENT';
export const THEME_REQUEST_CURRENT = 'THEME_REQUEST_CURRENT';
export const THEME_REQUEST_CURRENT_FAILURE = 'THEME_REQUEST_CURRENT_FAILURE';
export const THEME_SIGNUP_WITH = 'THEME_SIGNUP_WITH';
export const THEMES_INCREMENT_PAGE = 'THEMES_INCREMENT_PAGE';
export const THEMES_QUERY = 'THEMES_QUERY';
export const THEMES_RECEIVE = 'THEMES_RECEIVE';
export const THEMES_RECEIVE_SERVER_ERROR = 'THEMES_RECEIVE_SERVER_ERROR';
export const USER_RECEIVE = 'USER_RECEIVE';
export const WPORG_PLUGIN_DATA_RECEIVE = 'WPORG_PLUGIN_DATA_RECEIVE';
