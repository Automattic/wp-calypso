import wpcomRequest from 'wpcom-proxy-request';
import {
	DICTATION_CLIENT_SECRET_PATH,
	DICTATION_CLIENT_SECRET_REMAINING_TIME_PATH,
	DICTATION_CLIENT_SECRET_SETTLE_PATH,
} from './constants';
import { getErrorMessage } from './errors';

const ACTIVE_SESSION_ERROR_CODE = 'dictation_client_secret_active_session_exists';
const ACTIVE_SESSION_ERROR_MESSAGE =
	'Another dictation session is already active. Stop dictation in the other tab or window, then try again.';

interface FetchClientSecretArgs {
	instructions: string;
}

interface DictationClientSecret {
	value: string;
	remainingTimeSeconds: number;
}

export interface DictationRemainingTime {
	remainingTimeSeconds: number;
	totalTimeSeconds: number;
	activeSession: {
		sessionId: string;
		startedAt: number;
		expiresAt: number;
		remainingTimeSeconds: number;
	} | null;
}

export class ActiveDictationSessionError extends Error {
	code = ACTIVE_SESSION_ERROR_CODE;

	constructor() {
		super( ACTIVE_SESSION_ERROR_MESSAGE );
		this.name = 'ActiveDictationSessionError';
	}
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
		activeSession,
	};
}

export async function fetchClientSecret( {
	instructions,
}: FetchClientSecretArgs ): Promise< DictationClientSecret > {
	let response: unknown;

	try {
		response = await wpcomRequest( {
			path: DICTATION_CLIENT_SECRET_PATH,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			body: {
				session: {
					instructions,
				},
			},
		} );
	} catch ( error ) {
		if ( isActiveDictationSessionError( error ) ) {
			throw new ActiveDictationSessionError();
		}
		throw error;
	}

	return extractClientSecret( response );
}

export async function fetchRemainingTime(): Promise< DictationRemainingTime > {
	const response = await wpcomRequest( {
		path: DICTATION_CLIENT_SECRET_REMAINING_TIME_PATH,
		method: 'GET',
		apiNamespace: 'wpcom/v2',
	} );

	return extractRemainingTime( response );
}

export async function settleClientSecretSession(): Promise< void > {
	await wpcomRequest( {
		path: DICTATION_CLIENT_SECRET_SETTLE_PATH,
		method: 'POST',
		apiNamespace: 'wpcom/v2',
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
	const route = `wpcom/v2${ path }`;
	const root = window.wpApiSettings?.root;
	if ( root ) {
		return new URL( route, root ).toString();
	}
	return `/wp-json/${ route }`;
}

function isActiveDictationSessionError( error: unknown ): boolean {
	if ( ! error || typeof error !== 'object' ) {
		return false;
	}

	const body = error as {
		code?: unknown;
		status?: unknown;
		statusCode?: unknown;
		data?: { status?: unknown };
	};
	const status = body.status ?? body.statusCode ?? body.data?.status;

	return (
		body.code === ACTIVE_SESSION_ERROR_CODE ||
		( status === 409 &&
			getErrorMessage( error ).toLowerCase().includes( 'active dictation session' ) )
	);
}
