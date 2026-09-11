/**
 * Base name of the `users/me` meta key the sitewide plan-expiry notice
 * dismisses to. The stored key is prefixed per site by the server
 * (`$wpdb->get_blog_prefix()`: `wp_` on Atomic, `wp_{blog_id}_` on Simple),
 * so callers match on the suffix. The value is a Unix timestamp in seconds,
 * written by the server regardless of what the client sends.
 */
export const PLAN_EXPIRY_NOTICE_DISMISS_META_KEY_SUFFIX = 'wpcom_plan_expiry_notice_dismiss';
