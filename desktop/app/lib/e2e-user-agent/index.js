// Playwright-driven runs are served the wordpress.com bot challenge in place of the login page.
// `wp-e2e-tests` is the user agent marker the edge allowlists, as sent by Calypso's web E2E suite:
// https://github.com/Automattic/wp-calypso/blob/8c4ad61bfd879fa808cc3084b89350ea62119060/test/e2e/playwright.config.ts#L46-L48
const E2E_USER_AGENT_SUFFIX = 'wp-e2e-tests';

/**
 * Marks the user agent as an E2E run when the app is launched by the desktop E2E suite.
 *
 * The marker is appended rather than replacing the user agent, so the run still identifies itself
 * as the desktop app.
 * @param {string} userAgent The user agent the app would otherwise send.
 * @param {Record<string, string|undefined>} env Environment carrying the E2E flag.
 * @returns {string} The user agent to send.
 */
function appendE2EUserAgentSuffix( userAgent, env ) {
	return env.WP_DESKTOP_E2E === 'true' ? `${ userAgent } ${ E2E_USER_AGENT_SUFFIX }` : userAgent;
}

module.exports = { appendE2EUserAgentSuffix, E2E_USER_AGENT_SUFFIX };
