/**
 * PostHog configuration for the CIAB dashboard.
 */

import config from '@automattic/calypso-config';
import type { AppConfig } from '../app/context';

/** CSS selector for elements whose text is safe to show. */
const UNMASK_SELECTOR =
	'.dashboard-header-bar, .dashboard-section-header, .environment-badge, h1, h2, h3, h4, h5, h6, label, th, button';

/** CSS selector for elements to block entirely from session recordings. */
const BLOCK_SELECTOR =
	'img[src*="gravatar.com"], img[src*="githubusercontent.com"], .site-activity-logs__actor-icon-avatar';

function maskText( text: string, element?: HTMLElement ): string {
	if ( element?.closest( UNMASK_SELECTOR ) ) {
		return text;
	}
	return '*'.repeat( text.length );
}

export function getPostHogConfig(): AppConfig[ 'posthog' ] {
	if ( ! config.isEnabled( 'posthog-tracking' ) ) {
		return undefined;
	}

	return {
		apiKey: config( 'ciab_posthog_api_key' ) as string,
		overrides: {
			session_recording: {
				maskTextFn: maskText,
				blockSelector: BLOCK_SELECTOR,
			},
		},
	};
}
