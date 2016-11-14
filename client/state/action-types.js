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

export const ACCOUNT_RECOVERY_FETCH = 'ACCOUNT_RECOVERY_FETCH';
export const ACCOUNT_RECOVERY_FETCH_FAILED = 'ACCOUNT_RECOVERY_FETCH_FAILED';
export const ACCOUNT_RECOVERY_FETCH_SUCCESS = 'ACCOUNT_RECOVERY_FETCH_SUCCESS';
export const ANALYTICS_EVENT_RECORD = 'ANALYTICS_EVENT_RECORD';
export const ANALYTICS_MULTI_TRACK = 'ANALYTICS_MULTI_TRACK';
export const ANALYTICS_PAGE_VIEW_RECORD = 'ANALYTICS_PAGE_VIEW_RECORD';
export const ANALYTICS_STAT_BUMP = 'ANALYTICS_STAT_BUMP';
export const COMMENTS_COUNT_RECEIVE = 'COMMENTS_COUNT_RECEIVE';
export const COMMENTS_ERROR = 'COMMENTS_ERROR';
export const COMMENTS_LIKE = 'COMMENTS_LIKE';
export const COMMENTS_LIKE_UPDATE = 'COMMENTS_LIKE_UPDATE';
export const COMMENTS_RECEIVE = 'COMMENTS_RECEIVE';
export const COMMENTS_REMOVE = 'COMMENTS_REMOVE';
export const COMMENTS_REQUEST = 'COMMENTS_REQUEST';
export const COMMENTS_REQUEST_FAILURE = 'COMMENTS_REQUEST_FAILURE';
export const COMMENTS_REQUEST_SUCCESS = 'COMMENTS_REQUEST_SUCCESS';
export const COMMENTS_UNLIKE = 'COMMENTS_UNLIKE';
export const COMPONENT_INTERACTION_TRACKED = 'COMPONENT_INTERACTION_TRACKED';
export const COMPONENTS_USAGE_STATS_RECEIVE = 'COMPONENTS_USAGE_STATS_RECEIVE';
export const COMPONENTS_USAGE_STATS_REQUEST = 'COMPONENTS_USAGE_STATS_REQUEST';
export const CONNECTION_LOST = 'CONNECTION_LOST';
export const CONNECTION_RESTORED = 'CONNECTION_RESTORED';
export const COUNTRY_STATES_RECEIVE = 'COUNTRY_STATES_RECEIVE';
export const COUNTRY_STATES_REQUEST = 'COUNTRY_STATES_REQUEST';
export const COUNTRY_STATES_REQUEST_FAILURE = 'COUNTRY_STATES_REQUEST_FAILURE';
export const COUNTRY_STATES_REQUEST_SUCCESS = 'COUNTRY_STATES_REQUEST_SUCCESS';
export const CURRENT_USER_ID_SET = 'CURRENT_USER_ID_SET';
export const DESERIALIZE = 'DESERIALIZE';
export const DOCUMENT_HEAD_LINK_ADD = 'DOCUMENT_HEAD_LINK_ADD';
export const DOCUMENT_HEAD_META_ADD = 'DOCUMENT_HEAD_META_ADD';
export const DOCUMENT_HEAD_TITLE_SET = 'DOCUMENT_HEAD_TITLE_SET';
export const DOCUMENT_HEAD_UNREAD_COUNT_SET = 'DOCUMENT_HEAD_UNREAD_COUNT_SET';
export const CURRENT_USER_FLAGS_RECEIVE = 'CURRENT_USER_FLAGS_RECEIVE';
export const DOMAINS_SUGGESTIONS_RECEIVE = 'DOMAINS_SUGGESTIONS_RECEIVE';
export const DOMAINS_SUGGESTIONS_REQUEST = 'DOMAINS_SUGGESTIONS_REQUEST';
export const DOMAINS_SUGGESTIONS_REQUEST_FAILURE = 'DOMAINS_SUGGESTIONS_REQUEST_FAILURE';
export const DOMAINS_SUGGESTIONS_REQUEST_SUCCESS = 'DOMAINS_SUGGESTIONS_REQUEST_SUCCESS';
export const EDITOR_CONTACT_FORM_CLEAR = 'EDITOR_CONTACT_FORM_CLEAR';
export const EDITOR_CONTACT_FORM_FIELD_ADD = 'EDITOR_CONTACT_FORM_FIELD_ADD';
export const EDITOR_CONTACT_FORM_FIELD_REMOVE = 'EDITOR_CONTACT_FORM_FIELD_REMOVE';
export const EDITOR_CONTACT_FORM_FIELD_UPDATE = 'EDITOR_CONTACT_FORM_FIELD_UPDATE';
export const EDITOR_CONTACT_FORM_LOAD = 'EDITOR_CONTACT_FORM_LOAD';
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
export const EXPORT_POST_TYPE_FIELD_SET = 'EXPORT_POST_TYPE_FIELD_SET';
export const EXPORT_POST_TYPE_SET = 'EXPORT_POST_TYPE_SET';
export const EXPORT_STARTED = 'EXPORT_STARTED';
export const EXPORT_START_REQUEST = 'EXPORT_START_REQUEST';
export const EXPORT_STATUS_FETCH = 'EXPORT_STATUS_FETCH';
export const FETCH_WPORG_PLUGIN_DATA = 'FETCH_WPORG_PLUGIN_DATA';
export const FIRST_VIEW_HIDE = 'FIRST_VIEW_HIDE';
export const FOLLOWERS_RECEIVE = 'FOLLOWERS_RECEIVE';
export const FOLLOWERS_REQUEST = 'FOLLOWERS_REQUEST';
export const FOLLOWERS_REQUEST_ERROR = 'FOLLOWERS_REQUEST_ERROR';
export const FOLLOWER_REMOVE_ERROR = 'FOLLOWER_REMOVE_ERROR';
export const FOLLOWER_REMOVE_REQUEST = 'FOLLOWER_REMOVE_REQUEST';
export const FOLLOWER_REMOVE_SUCCESS = 'FOLLOWER_REMOVE_SUCCESS';
export const GEO_RECEIVE = 'GEO_RECEIVE';
export const GEO_REQUEST = 'GEO_REQUEST';
export const GEO_REQUEST_FAILURE = 'GEO_REQUEST_FAILURE';
export const GEO_REQUEST_SUCCESS = 'GEO_REQUEST_SUCCESS';
export const GOOGLE_APPS_USERS_FETCH = 'GOOGLE_APPS_USERS_FETCH';
export const GOOGLE_APPS_USERS_FETCH_COMPLETED = 'GOOGLE_APPS_USERS_FETCH_COMPLETED';
export const GOOGLE_APPS_USERS_FETCH_FAILED = 'GOOGLE_APPS_USERS_FETCH_FAILED';
export const GRAVATAR_UPLOAD_RECEIVE = 'GRAVATAR_UPLOAD_RECEIVE';
export const GRAVATAR_UPLOAD_REQUEST = 'GRAVATAR_UPLOAD_REQUEST';
export const GRAVATAR_UPLOAD_REQUEST_FAILURE = 'GRAVATAR_UPLOAD_REQUEST_FAILURE';
export const GRAVATAR_UPLOAD_REQUEST_SUCCESS = 'GRAVATAR_UPLOAD_REQUEST_SUCCESS';
export const GUIDED_TOUR_UPDATE = 'GUIDED_TOUR_UPDATE';
export const GUIDED_TRANSFER_HOST_DETAILS_SAVE = 'GUIDED_TRANSFER_HOST_DETAILS_SAVE';
export const GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE = 'GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE';
export const GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS = 'GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS';
export const GUIDED_TRANSFER_STATUS_RECEIVE = 'GUIDED_TRANSFER_STATUS_RECEIVE';
export const GUIDED_TRANSFER_STATUS_REQUEST = 'GUIDED_TRANSFER_STATUS_REQUEST';
export const GUIDED_TRANSFER_STATUS_REQUEST_FAILURE = 'GUIDED_TRANSFER_STATUS_REQUEST_FAILURE';
export const GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS = 'GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS';
export const HAPPINESS_ENGINEERS_FETCH = 'HAPPINESS_ENGINEERS_FETCH';
export const HAPPINESS_ENGINEERS_RECEIVE = 'HAPPINESS_ENGINEERS_RECEIVE';
export const HAPPINESS_ENGINEERS_FETCH_SUCCESS = 'HAPPINESS_ENGINEERS_FETCH_SUCCESS';
export const HAPPINESS_ENGINEERS_FETCH_FAILURE = 'HAPPINESS_ENGINEERS_FETCH_FAILURE';
export const HAPPYCHAT_CONNECT = 'HAPPYCHAT_CONNECT';
export const HAPPYCHAT_CONNECTING = 'HAPPYCHAT_CONNECTING';
export const HAPPYCHAT_CONNECTED = 'HAPPYCHAT_CONNECTED';
export const HAPPYCHAT_MINIMIZING = 'HAPPYCHAT_MINIMIZING';
export const HAPPYCHAT_SET_AVAILABLE = 'HAPPYCHAT_SET_AVAILABLE';
export const HAPPYCHAT_SET_CHAT_STATUS = 'HAPPYCHAT_SET_CHAT_STATUS';
export const HAPPYCHAT_SET_MESSAGE = 'HAPPYCHAT_SET_MESSAGE';
export const HAPPYCHAT_RECEIVE_EVENT = 'HAPPYCHAT_RECEIVE_EVENT';
export const HAPPYCHAT_OPEN = 'HAPPYCHAT_OPEN';
export const HELP_COURSES_RECEIVE = 'HELP_COURSES_RECEIVE';
export const IMAGE_EDITOR_CROP = 'IMAGE_EDITOR_CROP';
export const IMAGE_EDITOR_FLIP = 'IMAGE_EDITOR_FLIP';
export const IMAGE_EDITOR_IMAGE_HAS_LOADED = 'IMAGE_EDITOR_IMAGE_HAS_LOADED';
export const IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE = 'IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE';
export const IMAGE_EDITOR_SET_ASPECT_RATIO = 'IMAGE_EDITOR_SET_ASPECT_RATIO';
export const IMAGE_EDITOR_SET_CROP_BOUNDS = 'IMAGE_EDITOR_SET_CROP_BOUNDS';
export const IMAGE_EDITOR_SET_FILE_INFO = 'IMAGE_EDITOR_SET_FILE_INFO';
export const IMAGE_EDITOR_STATE_RESET = 'IMAGE_EDITOR_STATE_RESET';
export const IMAGE_EDITOR_STATE_RESET_ALL = 'IMAGE_EDITOR_STATE_RESET_ALL';
export const IMPORTS_AUTHORS_SET_MAPPING = 'IMPORTS_AUTHORS_SET_MAPPING';
export const IMPORTS_AUTHORS_START_MAPPING = 'IMPORTS_AUTHORS_START_MAPPING';
export const IMPORTS_FETCH = 'IMPORTS_FETCH';
export const IMPORTS_FETCH_COMPLETED = 'IMPORTS_FETCH_COMPLETED';
export const IMPORTS_FETCH_FAILED = 'IMPORTS_FETCH_FAILED';
export const IMPORTS_IMPORT_CANCEL = 'IMPORTS_IMPORT_CANCEL';
export const IMPORTS_IMPORT_LOCK = 'IMPORTS_IMPORT_LOCK';
export const IMPORTS_IMPORT_RECEIVE = 'IMPORTS_IMPORT_RECEIVE';
export const IMPORTS_IMPORT_RESET = 'IMPORTS_IMPORT_RESET';
export const IMPORTS_IMPORT_START = 'IMPORTS_IMPORT_START';
export const IMPORTS_IMPORT_UNLOCK = 'IMPORTS_IMPORT_UNLOCK';
export const IMPORTS_START_IMPORTING = 'IMPORTS_START_IMPORTING';
export const IMPORTS_STORE_RESET = 'IMPORTS_STORE_RESET';
export const IMPORTS_UPLOAD_COMPLETED = 'IMPORTS_UPLOAD_COMPLETED';
export const IMPORTS_UPLOAD_FAILED = 'IMPORTS_UPDLOAD_FAILED';
export const IMPORTS_UPLOAD_SET_PROGRESS = 'IMPORTS_UPLOAD_SET_PROGRESS';
export const IMPORTS_UPLOAD_START = 'IMPORTS_UPLOAD_START';
export const JETPACK_CONNECT_ACTIVATE_MANAGE = 'JETPACK_CONNECT_ACTIVATE_MANAGE';
export const JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE = 'JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE';
export const JETPACK_CONNECT_AUTHORIZE = 'JETPACK_CONNECT_AUTHORIZE';
export const JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE = 'JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE';
export const JETPACK_CONNECT_AUTHORIZE_RECEIVE = 'JETPACK_CONNECT_AUTHORIZE_RECEIVE';
export const JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST = 'JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST';
export const JETPACK_CONNECT_CHECK_URL = 'JETPACK_CONNECT_CHECK_URL';
export const JETPACK_CONNECT_CHECK_URL_RECEIVE = 'JETPACK_CONNECT_CHECK_URL_RECEIVE';
export const JETPACK_CONNECT_CONFIRM_JETPACK_STATUS = 'JETPACK_CONNECT_CONFIRM_JETPACK_STATUS';
export const JETPACK_CONNECT_COMPLETE_FLOW = 'JETPACK_CONNECT_COMPLETE_FLOW';
export const JETPACK_CONNECT_CREATE_ACCOUNT = 'JETPACK_CONNECT_CREATE_ACCOUNT';
export const JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE = 'JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE';
export const JETPACK_CONNECT_DISMISS_URL_STATUS = 'JETPACK_CONNECT_DISMISS_URL_STATUS';
export const JETPACK_CONNECT_QUERY_SET = 'JETPACK_CONNECT_QUERY_SET';
export const JETPACK_CONNECT_QUERY_UPDATE = 'JETPACK_CONNECT_QUERY_UPDATE';
export const JETPACK_CONNECT_REDIRECT = 'JETPACK_CONNECT_REDIRECT';
export const JETPACK_CONNECT_REDIRECT_WP_ADMIN = 'JETPACK_CONNECT_REDIRECT_WP_ADMIN';
export const JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL = 'JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL';
export const JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE = 'JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE';
export const JETPACK_CONNECT_SSO_AUTHORIZE_ERROR = 'JETPACK_CONNECT_SSO_AUTHORIZE_ERROR';
export const JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST = 'JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST';
export const JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS = 'JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS';
export const JETPACK_CONNECT_SSO_VALIDATION_ERROR = 'JETPACK_CONNECT_SSO_VALIDATION_ERROR';
export const JETPACK_CONNECT_SSO_VALIDATION_REQUEST = 'JETPACK_CONNECT_SSO_VALIDATION_REQUEST';
export const JETPACK_CONNECT_SSO_VALIDATION_SUCCESS = 'JETPACK_CONNECT_SSO_VALIDATION_SUCCESS';
export const JETPACK_CONNECT_STORE_SESSION = 'JETPACK_CONNECT_STORE_SESSION';
export const JETPACK_SYNC_START_REQUEST = 'JETPACK_SYNC_START_REQUEST';
export const JETPACK_SYNC_START_SUCCESS = 'JETPACK_SYNC_START_SUCCESS';
export const JETPACK_SYNC_START_ERROR = 'JETPACK_SYNC_START_ERROR';
export const JETPACK_SYNC_STATUS_REQUEST = 'JETPACK_SYNC_STATUS_REQUEST';
export const JETPACK_SYNC_STATUS_SUCCESS = 'JETPACK_SYNC_STATUS_SUCCESS';
export const JETPACK_SYNC_STATUS_ERROR = 'JETPACK_SYNC_STATUS_ERROR';
export const KEYRING_CONNECTIONS_RECEIVE = 'KEYRING_CONNECTIONS_RECEIVE';
export const KEYRING_CONNECTIONS_REQUEST = 'KEYRING_CONNECTIONS_REQUEST';
export const KEYRING_CONNECTIONS_REQUEST_FAILURE = 'KEYRING_CONNECTIONS_REQUEST_FAILURE';
export const KEYRING_CONNECTIONS_REQUEST_SUCCESS = 'KEYRING_CONNECTIONS_REQUEST_SUCCESS';
export const KEYRING_SERVICES_RECEIVE = 'KEYRING_SERVICES_RECEIVE';
export const KEYRING_SERVICES_REQUEST = 'KEYRING_SERVICES_REQUEST';
export const KEYRING_SERVICES_REQUEST_FAILURE = 'KEYRING_SERVICES_REQUEST_FAILURE';
export const KEYRING_SERVICES_REQUEST_SUCCESS = 'KEYRING_SERVICES_REQUEST_SUCCESS';
export const LAYOUT_FOCUS_SET = 'LAYOUT_FOCUS_SET';
export const LAYOUT_NEXT_FOCUS_SET = 'LAYOUT_NEXT_FOCUS_SET';
export const LAYOUT_NEXT_FOCUS_ACTIVATE = 'LAYOUT_NEXT_FOCUS_ACTIVATE';
export const MEDIA_MODAL_VIEW_SET = 'MEDIA_MODAL_VIEW_SET';
export const NOTICE_CREATE = 'NOTICE_CREATE';
export const NOTICE_REMOVE = 'NOTICE_REMOVE';
export const OLARK_READY = 'OLARK_READY';
export const OLARK_REQUEST = 'OLARK_REQUEST';
export const OLARK_TIMEOUT = 'OLARK_TIMEOUT';
export const PAGE_TEMPLATES_RECEIVE = 'PAGE_TEMPLATES_RECEIVE';
export const PAGE_TEMPLATES_REQUEST = 'PAGE_TEMPLATES_REQUEST';
export const PAGE_TEMPLATES_REQUEST_FAILURE = 'PAGE_TEMPLATES_REQUEST_FAILURE';
export const PAGE_TEMPLATES_REQUEST_SUCCESS = 'PAGE_TEMPLATES_REQUEST_SUCCESS';
export const PLANS_RECEIVE = 'PLANS_RECEIVE';
export const PLANS_REQUEST = 'PLANS_REQUEST';
export const PLANS_REQUEST_FAILURE = 'PLANS_REQUEST_FAILURE';
export const PLANS_REQUEST_SUCCESS = 'PLANS_REQUEST_SUCCESS';
export const PLUGIN_ACTIVATE_REQUEST = 'PLUGINS_ACTIVATE_REQUEST';
export const PLUGIN_ACTIVATE_REQUEST_FAILURE = 'PLUGINS_ACTIVATE_REQUEST_FAILURE';
export const PLUGIN_ACTIVATE_REQUEST_SUCCESS = 'PLUGINS_ACTIVATE_REQUEST_SUCCESS';
export const PLUGIN_AUTOUPDATE_ENABLE_REQUEST = 'PLUGIN_AUTOUPDATE_ENABLE_REQUEST';
export const PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE = 'PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE';
export const PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS = 'PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS';
export const PLUGIN_AUTOUPDATE_DISABLE_REQUEST = 'PLUGIN_AUTOUPDATE_DISABLE_REQUEST';
export const PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE = 'PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE';
export const PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS = 'PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS';
export const PLUGIN_DEACTIVATE_REQUEST = 'PLUGIN_DEACTIVATE_REQUEST';
export const PLUGIN_DEACTIVATE_REQUEST_FAILURE = 'PLUGIN_DEACTIVATE_REQUEST_FAILURE';
export const PLUGIN_DEACTIVATE_REQUEST_SUCCESS = 'PLUGIN_DEACTIVATE_REQUEST_SUCCESS';
export const PLUGIN_INSTALL_REQUEST = 'PLUGIN_INSTALL_REQUEST';
export const PLUGIN_INSTALL_REQUEST_FAILURE = 'PLUGIN_INSTALL_REQUEST_FAILURE';
export const PLUGIN_INSTALL_REQUEST_SUCCESS = 'PLUGIN_INSTALL_REQUEST_SUCCESS';
export const PLUGIN_REMOVE_REQUEST = 'PLUGIN_REMOVE_REQUEST';
export const PLUGIN_REMOVE_REQUEST_FAILURE = 'PLUGIN_REMOVE_REQUEST_FAILURE';
export const PLUGIN_REMOVE_REQUEST_SUCCESS = 'PLUGIN_REMOVE_REQUEST_SUCCESS';
export const PLUGIN_SETUP_ACTIVATE = 'PLUGIN_SETUP_ACTIVATE';
export const PLUGIN_SETUP_CONFIGURE = 'PLUGIN_SETUP_CONFIGURE';
export const PLUGIN_SETUP_ERROR = 'PLUGIN_SETUP_ERROR';
export const PLUGIN_SETUP_FINISH = 'PLUGIN_SETUP_FINISH';
export const PLUGIN_SETUP_INSTALL = 'PLUGIN_SETUP_INSTALL';
export const PLUGIN_SETUP_INSTRUCTIONS_FETCH = 'PLUGIN_SETUP_INSTRUCTIONS_FETCH';
export const PLUGIN_SETUP_INSTRUCTIONS_RECEIVE = 'PLUGIN_SETUP_INSTRUCTIONS_RECEIVE';
export const PLUGIN_UPDATE_REQUEST = 'PLUGINS_UPDATE_REQUEST';
export const PLUGIN_UPDATE_REQUEST_FAILURE = 'PLUGIN_UPDATE_REQUEST_FAILURE';
export const PLUGIN_UPDATE_REQUEST_SUCCESS = 'PLUGIN_UPDATE_REQUEST_SUCCESS';
export const PLUGINS_RECEIVE = 'PLUGINS_RECEIVE';
export const PLUGINS_REQUEST = 'PLUGINS_REQUEST';
export const PLUGINS_REQUEST_FAILURE = 'PLUGINS_REQUEST_FAILURE';
export const PLUGINS_REQUEST_SUCCESS = 'PLUGINS_REQUEST_SUCCESS';
export const POSTS_RECEIVE = 'POSTS_RECEIVE';
export const POSTS_REQUEST = 'POSTS_REQUEST';
export const POSTS_REQUEST_FAILURE = 'POSTS_REQUEST_FAILURE';
export const POSTS_REQUEST_SUCCESS = 'POSTS_REQUEST_SUCCESS';
export const POST_COUNTS_RECEIVE = 'POST_COUNTS_RECEIVE';
export const POST_COUNTS_REQUEST = 'POST_COUNTS_REQUEST';
export const POST_COUNTS_REQUEST_FAILURE = 'POST_COUNTS_REQUEST_FAILURE';
export const POST_COUNTS_REQUEST_SUCCESS = 'POST_COUNTS_REQUEST_SUCCESS';
export const POST_COUNTS_RESET_INTERNAL_STATE = 'POST_COUNTS_RESET_INTERNAL_STATE';
export const POST_DELETE = 'POST_DELETE';
export const POST_DELETE_FAILURE = 'POST_DELETE_FAILURE';
export const POST_DELETE_SUCCESS = 'POST_DELETE_SUCCESS';
export const POST_EDIT = 'POST_EDIT';
export const POST_EDITS_RESET = 'POST_EDITS_RESET';
export const POST_FORMATS_RECEIVE = 'POST_FORMATS_RECEIVE';
export const POST_FORMATS_REQUEST = 'POST_FORMATS_REQUEST';
export const POST_FORMATS_REQUEST_FAILURE = 'POST_FORMATS_REQUEST_FAILURE';
export const POST_FORMATS_REQUEST_SUCCESS = 'POST_FORMATS_REQUEST_SUCCESS';
export const POST_REQUEST = 'POST_REQUEST';
export const POST_REQUEST_FAILURE = 'POST_REQUEST_FAILURE';
export const POST_REQUEST_SUCCESS = 'POST_REQUEST_SUCCESS';
export const POST_RESTORE = 'POST_RESTORE';
export const POST_RESTORE_FAILURE = 'POST_RESTORE_FAILURE';
export const POST_RESTORE_SUCCESS = 'POST_RESTORE_SUCCESS';
export const POST_SAVE = 'POST_SAVE';
export const POST_SAVE_FAILURE = 'POST_SAVE_FAILURE';
export const POST_SAVE_SUCCESS = 'POST_SAVE_SUCCESS';
export const POST_STATS_RECEIVE = 'POST_STATS_RECEIVE';
export const POST_STATS_REQUEST = 'POST_STATS_REQUEST';
export const POST_STATS_REQUEST_FAILURE = 'POST_STATS_REQUEST_FAILURE';
export const POST_STATS_REQUEST_SUCCESS = 'POST_STATS_REQUEST_SUCCESS';
export const POST_TYPES_RECEIVE = 'POST_TYPES_RECEIVE';
export const POST_TYPES_REQUEST = 'POST_TYPES_REQUEST';
export const POST_TYPES_REQUEST_FAILURE = 'POST_TYPES_REQUEST_FAILURE';
export const POST_TYPES_REQUEST_SUCCESS = 'POST_TYPES_REQUEST_SUCCESS';
export const POST_TYPES_TAXONOMIES_RECEIVE = 'POST_TYPES_TAXONOMIES_RECEIVE';
export const POST_TYPES_TAXONOMIES_REQUEST = 'POST_TYPES_TAXONOMIES_REQUEST';
export const POST_TYPES_TAXONOMIES_REQUEST_FAILURE = 'POST_TYPES_TAXONOMIES_REQUEST_FAILURE';
export const POST_TYPES_TAXONOMIES_REQUEST_SUCCESS = 'POST_TYPES_TAXONOMIES_REQUEST_SUCCESS';
export const PREFERENCES_FETCH = 'PREFERENCES_FETCH';
export const PREFERENCES_FETCH_FAILURE = 'PREFERENCES_FETCH_FAILURE';
export const PREFERENCES_FETCH_SUCCESS = 'PREFERENCES_FETCH_SUCCESS';
export const PREFERENCES_RECEIVE = 'PREFERENCES_RECEIVE';
export const PREFERENCES_REMOVE = 'PREFERENCES_REMOVE';
export const PREFERENCES_SAVE = 'PREFERENCES_SAVE';
export const PREFERENCES_SAVE_FAILURE = 'PREFERENCES_SAVE_FAILURE';
export const PREFERENCES_SAVE_SUCCESS = 'PREFERENCES_SAVE_SUCCESS';
export const PREFERENCES_SET = 'PREFERENCES_SET';
export const PRESSABLE_TRANSFER_START = 'PRESSABLE_TRANSFER_START';
export const PRESSABLE_TRANSFER_SUCCESS = 'PRESSABLE_TRANSFER_SUCCESS';
export const PREVIEW_CUSTOMIZATIONS_CLEAR = 'PREVIEW_CUSTOMIZATIONS_CLEAR';
export const PREVIEW_CUSTOMIZATIONS_SAVED = 'PREVIEW_CUSTOMIZATIONS_SAVED';
export const PREVIEW_CUSTOMIZATIONS_UNDO = 'PREVIEW_CUSTOMIZATIONS_UNDO';
export const PREVIEW_CUSTOMIZATIONS_UPDATE = 'PREVIEW_CUSTOMIZATIONS_UPDATE';
export const PREVIEW_IS_SHOWING = 'PREVIEW_IS_SHOWING';
export const PREVIEW_MARKUP_RECEIVE = 'PREVIEW_MARKUP_RECEIVE';
export const PREVIEW_TOOL_SET = 'PREVIEW_TOOL_SET';
export const PREVIEW_TYPE_RESET = 'PREVIEW_TYPE_RESET';
export const PREVIEW_TYPE_SET = 'PREVIEW_TYPE_SET';
export const PREVIEW_URL_CLEAR = 'PREVIEW_URL_CLEAR';
export const PREVIEW_URL_SET = 'PREVIEW_URL_SET';
export const PRIVACY_PROTECTION_CANCEL = 'PRIVACY_PROTECTION_CANCEL';
export const PRIVACY_PROTECTION_CANCEL_COMPLETED = 'PRIVACY_PROTECTION_CANCEL_COMPLETED';
export const PRIVACY_PROTECTION_CANCEL_FAILED = 'PRIVACY_PROTECTION_CANCEL_FAILED';
export const PRODUCTS_LIST_RECEIVE = 'PRODUCTS_LIST_RECEIVE';
export const PRODUCTS_LIST_REQUEST = 'PRODUCTS_LIST_REQUEST';
export const PRODUCTS_LIST_REQUEST_FAILURE = 'PRODUCTS_LIST_REQUEST_FAILURE';
export const PUBLICIZE_CONNECTION_CREATE = 'PUBLICIZE_CONNECTION_CREATE';
export const PUBLICIZE_CONNECTION_CREATE_FAILURE = 'PUBLICIZE_CONNECTION_CREATE_FAILURE';
export const PUBLICIZE_CONNECTION_DELETE = 'PUBLICIZE_CONNECTION_DELETE';
export const PUBLICIZE_CONNECTION_DELETE_FAILURE = 'PUBLICIZE_CONNECTION_DELETE_FAILURE';
export const PUBLICIZE_CONNECTION_UPDATE = 'PUBLICIZE_CONNECTION_UPDATE';
export const PUBLICIZE_CONNECTION_UPDATE_FAILURE = 'PUBLICIZE_CONNECTION_UPDATE_FAILURE';
export const PUBLICIZE_CONNECTIONS_RECEIVE = 'PUBLICIZE_CONNECTIONS_RECEIVE';
export const PUBLICIZE_CONNECTIONS_REQUEST = 'PUBLICIZE_CONNECTIONS_REQUEST';
export const PUBLICIZE_CONNECTIONS_REQUEST_FAILURE = 'PUBLICIZE_CONNECTIONS_REQUEST_FAILURE';
export const PUBLICIZE_SHARE = 'PUBLICIZE_SHARE';
export const PUBLICIZE_SHARE_SUCCESS = 'PUBLICIZE_SHARE_SUCCESS';
export const PUBLICIZE_SHARE_FAILURE = 'PUBLICIZE_SHARE_FAILURE';
export const PUBLICIZE_SHARE_DISMISS = 'PUBLICIZE_SHARE_DISMISS';
export const PURCHASES_REMOVE = 'PURCHASES_REMOVE';
export const PURCHASES_SITE_FETCH = 'PURCHASES_SITE_FETCH';
export const PURCHASES_SITE_FETCH_COMPLETED = 'PURCHASES_SITE_FETCH_COMPLETED';
export const PURCHASES_SITE_FETCH_FAILED = 'PURCHASES_SITE_FETCH_FAILED';
export const PURCHASES_USER_FETCH = 'PURCHASES_USER_FETCH';
export const PURCHASES_USER_FETCH_COMPLETED = 'PURCHASES_USER_FETCH_COMPLETED';
export const PURCHASES_USER_FETCH_FAILED = 'PURCHASES_USER_FETCH_FAILED';
export const PURCHASE_REMOVE_COMPLETED = 'PURCHASE_REMOVE_COMPLETED';
export const PURCHASE_REMOVE_FAILED = 'PURCHASE_REMOVE_FAILED';
export const PUSH_NOTIFICATIONS_API_NOT_READY = 'PUSH_NOTIFICATIONS_API_NOT_READY';
export const PUSH_NOTIFICATIONS_API_READY = 'PUSH_NOTIFICATIONS_API_READY';
export const PUSH_NOTIFICATIONS_AUTHORIZE = 'PUSH_NOTIFICATIONS_AUTHORIZE';
export const PUSH_NOTIFICATIONS_BLOCK = 'PUSH_NOTIFICATIONS_BLOCK';
export const PUSH_NOTIFICATIONS_DISMISS_NOTICE = 'PUSH_NOTIFICATIONS_DISMISS_NOTICE';
export const PUSH_NOTIFICATIONS_MUST_PROMPT = 'PUSH_NOTIFICATIONS_MUST_PROMPT';
export const PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE = 'PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE';
export const PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE = 'PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE';
export const PUSH_NOTIFICATIONS_TOGGLE_ENABLED = 'PUSH_NOTIFICATIONS_TOGGLE_ENABLED';
export const PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS = 'PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS';
export const PUSH_NOTIFICATIONS_UNREGISTER_DEVICE = 'PUSH_NOTIFICATIONS_UNREGISTER_DEVICE';
export const READER_FOLLOW = 'READER_FOLLOW';
export const READER_FEED_REQUEST = 'READER_FEED_REQUEST';
export const READER_FEED_REQUEST_FAILURE = 'READER_FEED_REQUEST_FAILURE';
export const READER_FEED_REQUEST_SUCCESS = 'READER_FEED_REQUEST_SUCCESS';
export const READER_FEED_UPDATE = 'READER_FEED_UPDATE';
export const READER_FULLPOST_HIDE = 'READER_FULLPOST_HIDE';
export const READER_FULLPOST_SHOW = 'READER_FULLPOST_SHOW';
export const READER_LISTS_FOLLOW = 'READER_LISTS_FOLLOW';
export const READER_LISTS_FOLLOW_FAILURE = 'READER_LISTS_FOLLOW_FAILURE';
export const READER_LISTS_FOLLOW_SUCCESS = 'READER_LISTS_FOLLOW_SUCCESS';
export const READER_LISTS_RECEIVE = 'READER_LISTS_RECEIVE';
export const READER_LISTS_REQUEST = 'READER_LISTS_REQUEST';
export const READER_LISTS_REQUEST_FAILURE = 'READER_LISTS_REQUEST_FAILURE';
export const READER_LISTS_REQUEST_SUCCESS = 'READER_LISTS_REQUEST_SUCCESS';
export const READER_LISTS_UNFOLLOW = 'READER_LISTS_UNFOLLOW';
export const READER_LISTS_UNFOLLOW_FAILURE = 'READER_LISTS_UNFOLLOW_FAILURE';
export const READER_LISTS_UNFOLLOW_SUCCESS = 'READER_LISTS_UNFOLLOW_SUCCESS';
export const READER_LIST_DISMISS_NOTICE = 'READER_LIST_DISMISS_NOTICE';
export const READER_LIST_REQUEST = 'READER_LIST_REQUEST';
export const READER_LIST_REQUEST_FAILURE = 'READER_LIST_REQUEST_FAILURE';
export const READER_LIST_REQUEST_SUCCESS = 'READER_LIST_REQUEST_SUCCESS';
export const READER_LIST_UPDATE = 'READER_LIST_UPDATE';
export const READER_LIST_UPDATE_DESCRIPTION = 'READER_LIST_UPDATE_DESCRIPTION';
export const READER_LIST_UPDATE_FAILURE = 'READER_LIST_UPDATE_FAILURE';
export const READER_LIST_UPDATE_SUCCESS = 'READER_LIST_UPDATE_SUCCESS';
export const READER_LIST_UPDATE_TITLE = 'READER_LIST_UPDATE_TITLE';
export const READER_POSTS_RECEIVE = 'READER_POSTS_RECEIVE';
export const READER_RELATED_POSTS_RECEIVE = 'READER_RELATED_POSTS_RECEIVE';
export const READER_RELATED_POSTS_REQUEST = 'READER_RELATED_POSTS_REQUEST';
export const READER_RELATED_POSTS_REQUEST_FAILURE = 'READER_RELATED_POSTS_REQUEST_FAILURE';
export const READER_RELATED_POSTS_REQUEST_SUCCESS = 'READER_RELATED_POSTS_REQUEST_SUCCESS';
export const READER_SIDEBAR_LISTS_TOGGLE = 'READER_SIDEBAR_LISTS_TOGGLE';
export const READER_SIDEBAR_TAGS_TOGGLE = 'READER_SIDEBAR_TAGS_TOGGLE';
export const READER_SITE_REQUEST = 'READER_SITE_REQUEST';
export const READER_SITE_REQUEST_FAILURE = 'READER_SITE_REQUEST_FAILURE';
export const READER_SITE_REQUEST_SUCCESS = 'READER_SITE_REQUEST_SUCCESS';
export const READER_SITE_UPDATE = 'READER_SITE_UPDATE';
export const READER_START_GRADUATE_REQUEST = 'READER_START_GRADUATE_REQUEST';
export const READER_START_GRADUATED = 'READER_START_GRADUATED';
export const READER_START_GRADUATE_REQUEST_FAILURE = 'READER_START_GRADUATE_REQUEST_FAILURE';
export const READER_START_GRADUATE_REQUEST_SUCCESS = 'READER_START_GRADUATE_REQUEST_SUCCESS';
export const READER_START_RECOMMENDATIONS_RECEIVE = 'READER_START_RECOMMENDATIONS_RECEIVE';
export const READER_START_RECOMMENDATIONS_REQUEST = 'READER_START_RECOMMENDATIONS_REQUEST';
export const READER_START_RECOMMENDATIONS_REQUEST_FAILURE = 'READER_START_RECOMMENDATIONS_REQUEST_FAILURE';
export const READER_START_RECOMMENDATIONS_REQUEST_SUCCESS = 'READER_START_RECOMMENDATIONS_REQUEST_SUCCESS';
export const READER_START_RECOMMENDATION_INTERACTION = 'READER_START_RECOMMENDATION_INTERACTION';
export const READER_UNFOLLOW = 'READER_UNFOLLOW';
export const RECEIPT_FETCH = 'RECEIPT_FETCH';
export const RECEIPT_FETCH_COMPLETED = 'RECEIPT_FETCH_COMPLETED';
export const RECEIPT_FETCH_FAILED = 'RECEIPT_FETCH_FAILED';
export const ROUTE_SET = 'ROUTE_SET';
export const SECTION_SET = 'SECTION_SET';
export const SELECTED_SITE_SET = 'SELECTED_SITE_SET';
export const SERIALIZE = 'SERIALIZE';
export const SERVER_DESERIALIZE = 'SERVER_DESERIALIZE';
export const SEO_TITLE_SET = 'SEO_TITLE_SET';
export const SHORTCODE_RECEIVE = 'SHORTCODE_RECEIVE';
export const SHORTCODE_REQUEST = 'SHORTCODE_REQUEST';
export const SHORTCODE_REQUEST_FAILURE = 'SHORTCODE_REQUEST_FAILURE';
export const SHORTCODE_REQUEST_SUCCESS = 'SHORTCODE_REQUEST_SUCCESS';
export const SIGNUP_COMPLETE_RESET = 'SIGNUP_COMPLETE_RESET';
export const SIGNUP_DEPENDENCY_STORE_UPDATE = 'SIGNUP_DEPENDENCY_STORE_UPDATE';
export const SIGNUP_STEPS_SITE_TITLE_SET = 'SIGNUP_STEPS_SITE_TITLE_SET';
export const SIGNUP_STEPS_SURVEY_SET = 'SIGNUP_STEPS_SURVEY_SET';
export const SITE_DOMAINS_RECEIVE = 'SITE_DOMAINS_RECEIVE';
export const SITE_DOMAINS_REQUEST = 'SITE_DOMAINS_REQUEST';
export const SITE_DOMAINS_REQUEST_FAILURE = 'SITE_DOMAINS_REQUEST_FAILURE';
export const SITE_DOMAINS_REQUEST_SUCCESS = 'SITE_DOMAINS_REQUEST_SUCCESS';
export const SITE_FRONT_PAGE_SET = 'SITE_FRONT_PAGE_SET';
export const SITE_FRONT_PAGE_SET_FAILURE = 'SITE_FRONT_PAGE_FAILURE';
export const SITE_FRONT_PAGE_SET_SUCCESS = 'SITE_FRONT_PAGE_SUCCESS';
export const SITE_MEDIA_STORAGE_RECEIVE = 'SITE_MEDIA_STORAGE_RECEIVE';
export const SITE_MEDIA_STORAGE_REQUEST = 'SITE_MEDIA_STORAGE_REQUEST';
export const SITE_MEDIA_STORAGE_REQUEST_FAILURE = 'SITE_MEDIA_STORAGE_REQUEST_FAILURE';
export const SITE_MEDIA_STORAGE_REQUEST_SUCCESS = 'SITE_MEDIA_STORAGE_REQUEST_SUCCESS';
export const SITE_PLANS_FETCH = 'SITE_PLANS_FETCH';
export const SITE_PLANS_FETCH_COMPLETED = 'SITE_PLANS_FETCH_COMPLETED';
export const SITE_PLANS_FETCH_FAILED = 'SITE_PLANS_FETCH_FAILED';
export const SITE_PLANS_REMOVE = 'SITE_PLANS_REMOVE';
export const SITE_PLANS_TRIAL_CANCEL = 'SITE_PLANS_TRIAL_CANCEL';
export const SITE_PLANS_TRIAL_CANCEL_COMPLETED = 'SITE_PLANS_TRIAL_CANCEL_COMPLETED';
export const SITE_PLANS_TRIAL_CANCEL_FAILED = 'SITE_PLANS_TRIAL_CANCEL_FAILED';
export const SITE_RECEIVE = 'SITE_RECEIVE';
export const SITE_REQUEST = 'SITE_REQUEST';
export const SITE_REQUEST_FAILURE = 'SITE_REQUEST_FAILURE';
export const SITE_REQUEST_SUCCESS = 'SITE_REQUEST_SUCCESS';
export const SITE_SETTINGS_RECEIVE = 'SITE_SETTINGS_RECEIVE';
export const SITE_SETTINGS_REQUEST = 'SITE_SETTINGS_REQUEST';
export const SITE_SETTINGS_REQUEST_FAILURE = 'SITE_SETTINGS_REQUEST_FAILURE';
export const SITE_SETTINGS_REQUEST_SUCCESS = 'SITE_SETTINGS_REQUEST_SUCCESS';
export const SITE_SETTINGS_SAVE = 'SITE_SETTINGS_SAVE';
export const SITE_SETTINGS_SAVE_FAILURE = 'SITE_SETTINGS_SAVE_FAILURE';
export const SITE_SETTINGS_SAVE_SUCCESS = 'SITE_SETTINGS_SAVE_SUCCESS';
export const SITE_SETTINGS_UPDATE = 'SITE_SETTINGS_UPDATE';
export const SITE_STATS_RECEIVE = 'SITE_STATS_RECEIVE';
export const SITE_STATS_REQUEST = 'SITE_STATS_REQUEST';
export const SITE_STATS_REQUEST_FAILURE = 'SITE_STATS_REQUEST_FAILURE';
export const SITE_STATS_REQUEST_SUCCESS = 'SITE_STATS_REQUEST_SUCCESS';
export const SITE_UPDATES_RECEIVE = 'SITE_UPDATES_RECEIVE';
export const SITE_UPDATES_REQUEST = 'SITE_UPDATES_REQUEST';
export const SITE_UPDATES_REQUEST_FAILURE = 'SITE_UPDATES_REQUEST_FAILURE';
export const SITE_UPDATES_REQUEST_SUCCESS = 'SITE_UPDATES_REQUEST_SUCCESS';
export const SITE_VOUCHERS_ASSIGN_RECEIVE = 'SITE_VOUCHERS_ASSIGN_RECEIVE';
export const SITE_VOUCHERS_ASSIGN_REQUEST = 'SITE_VOUCHERS_ASSIGN_REQUEST';
export const SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE = 'SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE';
export const SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS = 'SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS';
export const SITE_VOUCHERS_RECEIVE = 'SITE_VOUCHERS_RECEIVE';
export const SITE_VOUCHERS_REQUEST = 'SITE_VOUCHERS_REQUEST';
export const SITE_VOUCHERS_REQUEST_FAILURE = 'SITE_VOUCHERS_REQUEST_FAILURE';
export const SITE_VOUCHERS_REQUEST_SUCCESS = 'SITE_VOUCHERS_REQUEST_SUCCESS';
export const SITES_RECEIVE = 'SITES_RECEIVE';
export const SITES_REQUEST = 'SITES_REQUEST';
export const SITES_REQUEST_FAILURE = 'SITES_REQUEST_FAILURE';
export const SITES_REQUEST_SUCCESS = 'SITES_REQUEST_SUCCESS';
export const SUPPORT_USER_ACTIVATE = 'SUPPORT_USER_ACTIVATE';
export const STORED_CARDS_ADD_COMPLETED = 'STORED_CARDS_ADD_COMPLETED';
export const STORED_CARDS_DELETE = 'STORED_CARDS_DELETE';
export const STORED_CARDS_DELETE_COMPLETED = 'STORED_CARDS_DELETE_COMPLETED';
export const STORED_CARDS_DELETE_FAILED = 'STORED_CARDS_DELETE_FAILED';
export const STORED_CARDS_FETCH = 'STORED_CARDS_FETCH';
export const STORED_CARDS_FETCH_COMPLETED = 'STORED_CARDS_FETCH_COMPLETED';
export const STORED_CARDS_FETCH_FAILED = 'STORED_CARDS_FETCH_FAILED';
export const SUPPORT_USER_ERROR = 'SUPPORT_USER_ERROR';
export const SUPPORT_USER_TOGGLE_DIALOG = 'SUPPORT_USER_TOGGLE_DIALOG';
export const SUPPORT_USER_TOKEN_FETCH = 'SUPPORT_USER_TOKEN_FETCH';
export const TERMS_RECEIVE = 'TERMS_RECEIVE';
export const TERMS_REQUEST = 'TERMS_REQUEST';
export const TERMS_REQUEST_FAILURE = 'TERMS_REQUEST_FAILURE';
export const TERMS_REQUEST_SUCCESS = 'TERMS_REQUEST_SUCCESS';
export const TERM_REMOVE = 'TERM_REMOVE';
export const THEMES_INCREMENT_PAGE = 'THEMES_INCREMENT_PAGE';
export const THEMES_QUERY = 'THEMES_QUERY';
export const THEMES_RECEIVE = 'THEMES_RECEIVE';
export const THEMES_RECEIVE_SERVER_ERROR = 'THEMES_RECEIVE_SERVER_ERROR';
export const THEME_ACTIVATE_REQUEST = 'THEME_ACTIVATE_REQUEST';
export const THEME_ACTIVATE_REQUEST_SUCCESS = 'THEME_ACTIVATE_REQUEST_SUCCESS';
export const THEME_ACTIVATE_REQUEST_FAILURE = 'THEME_ACTIVATE_REQUEST_FAILURE';
export const THEME_BACK_PATH_SET = 'THEME_BACK_PATH_SET';
export const THEME_CLEAR_ACTIVATED = 'THEME_CLEAR_ACTIVATED';
export const THEME_DETAILS_REQUEST = 'THEME_DETAILS_REQUEST';
export const THEME_DETAILS_RECEIVE = 'THEME_DETAILS_RECEIVE';
export const THEME_DETAILS_RECEIVE_FAILURE = 'THEME_DETAILS_RECEIVE_FAILURE';
export const THEME_RECEIVE_CURRENT = 'THEMES_RECEIVE_CURRENT';
export const THEME_REQUEST_CURRENT = 'THEME_REQUEST_CURRENT';
export const THEME_REQUEST_CURRENT_FAILURE = 'THEME_REQUEST_CURRENT_FAILURE';
export const USER_RECEIVE = 'USER_RECEIVE';
export const WORDADS_STATUS_REQUEST = 'WORDADS_STATUS_REQUEST';
export const WORDADS_STATUS_REQUEST_FAILURE = 'WORDADS_STATUS_REQUEST_FAILURE';
export const WORDADS_STATUS_REQUEST_SUCCESS = 'WORDADS_STATUS_REQUEST_SUCCESS';
export const WORDADS_SITE_APPROVE_REQUEST = 'WORDADS_SITE_APPROVE_REQUEST';
export const WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR = 'WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR';
export const WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS = 'WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS';
export const WORDADS_SITE_APPROVE_REQUEST_FAILURE = 'WORDADS_SITE_APPROVE_REQUEST_FAILURE';
export const WORDADS_SITE_APPROVE_REQUEST_SUCCESS = 'WORDADS_SITE_APPROVE_REQUEST_SUCCESS';
export const WPORG_PLUGIN_DATA_RECEIVE = 'WPORG_PLUGIN_DATA_RECEIVE';
