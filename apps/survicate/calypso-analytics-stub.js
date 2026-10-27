/*
 * Stands in for `@automattic/calypso-analytics` in the wp-admin bundle.
 *
 * On Atomic sites served from a custom domain the browser never sends the
 * wordpress.com `country_code` / `sensitive_pixel_options` cookies, so the
 * real module falls back to GDPR defaults that allow analytics and would
 * record events for users who opted out. Importing it also loads the Tracks
 * script eagerly. Until PHP can pass the user's tracking consent through
 * `window.wpcomSurvicateConfig`, the bundle records nothing.
 */
export function recordTracksEvent() {}
