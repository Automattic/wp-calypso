import posthog from 'posthog-js';

const POSTHOG_API_KEY = 'phc_tHmeIeJcb4zGfiX4akJwyGq7lioUpCoHd65LKbVPcoR';

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

export function init( user?: PostHogUser ) {
	if ( initialized ) {
		return;
	}

	initialized = true;

	posthog.init( POSTHOG_API_KEY, {
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
