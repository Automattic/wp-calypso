import { getTrackingPrefs } from '@automattic/calypso-analytics';
import posthog from 'posthog-js';

let initialized = false;

export interface PostHogUser {
	ID: number;
	email?: string;
	username?: string;
}

export interface PostHogOverrides {
	debug?: boolean;
	session_recording?: {
		maskAllInputs?: boolean;
		maskTextSelector?: string;
		maskTextFn?: ( text: string, element?: HTMLElement ) => string;
		blockSelector?: string;
	};
}

export function getSessionId(): string | undefined {
	return posthog.get_session_id?.();
}

export function reset() {
	posthog.reset();
	initialized = false;
}

export function init( apiKey: string, user?: PostHogUser, overrides?: PostHogOverrides ) {
	if ( initialized || ! apiKey ) {
		return;
	}

	const { buckets } = getTrackingPrefs();
	if ( ! buckets.advertising ) {
		return;
	}

	initialized = true;

	const sessionRecording = overrides?.session_recording;

	const posthogConfig = {
		api_host: 'https://us.i.posthog.com',
		autocapture: true,
		defaults: '2026-01-30' as const,
		capture_pageleave: true,
		debug: overrides?.debug ?? false,
		session_recording: {
			maskAllInputs: sessionRecording?.maskAllInputs ?? true,
			maskTextSelector: sessionRecording?.maskTextSelector ?? '*',
			...( sessionRecording?.maskTextFn && { maskTextFn: sessionRecording.maskTextFn } ),
			...( sessionRecording?.blockSelector && {
				blockSelector: sessionRecording.blockSelector,
			} ),
		},
		...( user?.ID && {
			bootstrap: {
				distinctID: String( user.ID ),
				isIdentifiedID: true,
			},
		} ),
	};

	if ( overrides?.debug ) {
		( window as unknown as Record< string, unknown > ).__posthogConfig = posthogConfig;
	}

	posthog.init( apiKey, posthogConfig );

	if ( user?.ID ) {
		posthog.identify( String( user.ID ), {
			...( user.email && { email: user.email } ),
			...( user.username && { username: user.username } ),
		} );
	}
}
