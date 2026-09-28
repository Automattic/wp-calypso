/**
 * Base name of the `users/me` meta key the sitewide plan-expiry notice dismisses
 * to. The server prefixes it per site (`$wpdb->get_blog_prefix()`), so callers
 * match on the suffix, and stamps the value itself whatever the client sends.
 */
export const PLAN_EXPIRY_NOTICE_DISMISS_META_KEY_SUFFIX = 'wpcom_plan_expiry_notice_dismiss';
