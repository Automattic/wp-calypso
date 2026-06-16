import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import {
	DICTATION_CLIENT_SECRET_PATH,
	DICTATION_CLIENT_SECRET_REMAINING_TIME_PATH,
	DICTATION_CLIENT_SECRET_SETTLE_PATH,
} from './constants';

interface FetchClientSecretArgs {
	instructions: string;
}

interface DictationClientSecret {
	value: string;
	remainingTimeSeconds: number;
}

interface DictationEndpointRequest {
	path: string;
	method: 'GET' | 'POST';
	body?: object;
}

export interface DictationRemainingTime {
	remainingTimeSeconds: number;
	totalTimeSeconds: number;
	canUpgrade: boolean;
	activeSession: {
		sessionId: string;
		startedAt: number;
		expiresAt: number;
		remainingTimeSeconds: number;
	} | null;
}

declare global {
	interface Window {
		wpApiSettings?: {
			nonce?: string;
			root?: string;
		};
	}
}

function extractClientSecret( data: unknown ): DictationClientSecret {
	const body = data as {
		client_secret?: string | { value?: string };
		remaining_time_seconds?: number;
		value?: string;
		token?: string;
	};
	const value =
		typeof body.client_secret === 'string'
			? body.client_secret
			: body.client_secret?.value ?? body.value ?? body.token ?? '';
	const remainingTimeSeconds =
		typeof body.remaining_time_seconds === 'number' ? body.remaining_time_seconds : 0;

	if ( ! value ) {
		throw new Error( 'Dictation client secret endpoint returned no client secret.' );
	}
	if ( ! remainingTimeSeconds ) {
		throw new Error( 'Dictation client secret endpoint returned no remaining time.' );
	}

	return { value, remainingTimeSeconds };
}

function extractRemainingTime( data: unknown ): DictationRemainingTime {
	const body = data as {
		seconds_used?: number;
		seconds_remaining?: number;
		remaining_time_seconds?: number;
		can_upgrade?: boolean;
		active_session?: {
			session_id?: string;
			started_at?: number;
			expires_at?: number;
			remaining_time_seconds?: number;
		} | null;
	};
	const secondsUsed = typeof body.seconds_used === 'number' ? body.seconds_used : 0;
	const secondsRemaining = typeof body.seconds_remaining === 'number' ? body.seconds_remaining : 0;
	const remainingTimeSeconds =
		typeof body.remaining_time_seconds === 'number'
			? body.remaining_time_seconds
			: secondsRemaining;
	const activeSession = body.active_session
		? {
				sessionId: body.active_session.session_id ?? '',
				startedAt: body.active_session.started_at ?? 0,
				expiresAt: body.active_session.expires_at ?? 0,
				remainingTimeSeconds: body.active_session.remaining_time_seconds ?? 0,
		  }
		: null;

	return {
		remainingTimeSeconds,
		totalTimeSeconds: secondsUsed + secondsRemaining,
		canUpgrade: Boolean( body.can_upgrade ),
		activeSession,
	};
}

export async function fetchClientSecret( {
	instructions,
}: FetchClientSecretArgs ): Promise< DictationClientSecret > {
	const response = await requestDictationEndpoint( {
		path: DICTATION_CLIENT_SECRET_PATH,
		method: 'POST',
		body: {
			session: {
				instructions,
			},
		},
	} );

	return extractClientSecret( response );
}

export async function fetchRemainingTime(): Promise< DictationRemainingTime > {
	const response = await requestDictationEndpoint( {
		path: DICTATION_CLIENT_SECRET_REMAINING_TIME_PATH,
		method: 'GET',
	} );

	return extractRemainingTime( response );
}

export async function settleClientSecretSession(): Promise< void > {
	await requestDictationEndpoint( {
		path: DICTATION_CLIENT_SECRET_SETTLE_PATH,
		method: 'POST',
	} );
}

export function settleClientSecretSessionOnUnload(): boolean {
	if ( ! navigator.sendBeacon ) {
		return false;
	}

	const nonce = window.wpApiSettings?.nonce;
	if ( ! nonce ) {
		return navigator.sendBeacon( getWpRestUrl( DICTATION_CLIENT_SECRET_SETTLE_PATH ) );
	}

	const body = new FormData();
	body.append( '_wpnonce', nonce );

	return navigator.sendBeacon( getWpRestUrl( DICTATION_CLIENT_SECRET_SETTLE_PATH ), body );
}

function getWpRestUrl( path: string ): string {
	const route = getWpRestPath( path );
	const root = window.wpApiSettings?.root;
	if ( root ) {
		return new URL( route, root ).toString();
	}
	return `/wp-json/${ route }`;
}

function getWpRestPath( path: string ): string {
	return `wpcom/v2${ path }`;
}

function requestDictationEndpoint< T = unknown >( {
	path,
	method,
	body,
}: DictationEndpointRequest ): Promise< T > {
	if ( canAccessWpcomApis() ) {
		return wpcomRequest< T >( {
			path,
			method,
			apiNamespace: 'wpcom/v2',
			body,
		} );
	}

	return apiFetch< T >( {
		path: `/${ getWpRestPath( path ) }`,
		method,
		...( body ? { data: body } : {} ),
	} );
}
