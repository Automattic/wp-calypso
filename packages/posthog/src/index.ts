import { getTrackingPrefs } from '@automattic/calypso-analytics';
import posthog from 'posthog-js';

let initialized = false;

export interface PostHogUser {
	ID: number;
	email?: string;
	username?: string;
}

export function getSessionId(): string | undefined {
	return posthog.get_session_id?.();
}

export function reset() {
	posthog.reset();
	initialized = false;
}

export function init( apiKey: string, user?: PostHogUser ) {
	if ( initialized || ! apiKey ) {
		return;
	}

	const { buckets } = getTrackingPrefs();
	if ( ! buckets.advertising ) {
		return;
	}

	initialized = true;

	posthog.init( apiKey, {
		api_host: 'https://us.i.posthog.com',
		autocapture: true,
		defaults: '2026-01-30',
		capture_pageleave: true,
		debug: false,
		...( user?.ID && {
			bootstrap: {
				distinctID: String( user.ID ),
				isIdentifiedID: true,
			},
		} ),
	} );

	if ( user?.ID ) {
		posthog.identify( String( user.ID ), {
			...( user.email && { email: user.email } ),
			...( user.username && { username: user.username } ),
		} );
	}
}
