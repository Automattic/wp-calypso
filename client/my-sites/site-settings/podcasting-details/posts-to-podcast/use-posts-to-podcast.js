import { useCallback, useEffect, useReducer, useRef } from 'react';
import wpcom from 'calypso/lib/wp';

const POLL_FAST_MS = 3000;
const POLL_SLOW_MS = 10000;
const POLL_SWITCH_MS = 30000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const storageKey = ( siteId ) => `posts-to-podcast:active-job:${ siteId }`;

function readStored( siteId ) {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	try {
		const raw = window.localStorage.getItem( storageKey( siteId ) );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw );
		if ( ! parsed || ! parsed.jobId || typeof parsed.startedAt !== 'number' ) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function writeStored( siteId, value ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( storageKey( siteId ), JSON.stringify( value ) );
	} catch {}
}

function clearStored( siteId ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.removeItem( storageKey( siteId ) );
	} catch {}
}

const initial = {
	status: 'idle',
	jobId: null,
	startedAt: null,
	result: null,
	error: null,
};

function reducer( state, action ) {
	switch ( action.type ) {
		case 'START_POLLING':
			return {
				status: 'polling',
				jobId: action.jobId,
				startedAt: action.startedAt,
				result: null,
				error: null,
			};
		case 'SUCCEEDED':
			return { ...state, status: 'succeeded', result: action.result };
		case 'FAILED':
			return { ...state, status: 'failed', error: action.error };
		case 'RESET':
			return initial;
		default:
			return state;
	}
}

export function usePostsToPodcastJob( siteId ) {
	const [ state, dispatch ] = useReducer( reducer, initial, ( init ) => {
		const stored = readStored( siteId );
		if ( stored && Date.now() - stored.startedAt < POLL_TIMEOUT_MS ) {
			return {
				...init,
				status: 'polling',
				jobId: stored.jobId,
				startedAt: stored.startedAt,
			};
		}
		if ( stored ) {
			clearStored( siteId );
		}
		return init;
	} );

	const timerRef = useRef( null );

	useEffect( () => {
		if ( state.status !== 'polling' ) {
			return undefined;
		}

		let cancelled = false;

		async function poll() {
			if ( Date.now() - state.startedAt > POLL_TIMEOUT_MS ) {
				clearStored( siteId );
				dispatch( {
					type: 'FAILED',
					error: { code: 'timeout', message: null },
				} );
				return;
			}
			try {
				const record = await wpcom.req.get( {
					path: `/sites/${ siteId }/posts-to-podcast/jobs/${ state.jobId }`,
					apiNamespace: 'wpcom/v2',
				} );
				if ( cancelled ) {
					return;
				}
				if ( record.status === 'complete' ) {
					clearStored( siteId );
					dispatch( {
						type: 'SUCCEEDED',
						result: { postId: record.postId, editUrl: record.editUrl },
					} );
					return;
				}
				if ( record.status === 'failed' ) {
					clearStored( siteId );
					dispatch( {
						type: 'FAILED',
						error: {
							code: record.errorCode || 'job-failed',
							message: record.message || record.errorMessage || null,
						},
					} );
					return;
				}
				const elapsed = Date.now() - state.startedAt;
				const nextDelay = elapsed + POLL_FAST_MS < POLL_SWITCH_MS ? POLL_FAST_MS : POLL_SLOW_MS;
				timerRef.current = setTimeout( poll, nextDelay );
			} catch {
				if ( cancelled ) {
					return;
				}
				clearStored( siteId );
				dispatch( {
					type: 'FAILED',
					error: { code: 'poll-failed', message: null },
				} );
			}
		}

		poll();

		return () => {
			cancelled = true;
			if ( timerRef.current ) {
				clearTimeout( timerRef.current );
				timerRef.current = null;
			}
		};
	}, [ state.status, state.jobId, state.startedAt, siteId ] );

	const generate = useCallback(
		async ( { window: windowParam, length, voicePreset } ) => {
			try {
				const response = await wpcom.req.post( {
					path: `/sites/${ siteId }/posts-to-podcast`,
					apiNamespace: 'wpcom/v2',
					body: { window: windowParam, length, voicePreset },
				} );
				if ( ! response?.jobId ) {
					dispatch( {
						type: 'FAILED',
						error: { code: 'queue-failed', message: null },
					} );
					return;
				}
				const startedAt = Date.now();
				writeStored( siteId, { jobId: response.jobId, startedAt } );
				dispatch( { type: 'START_POLLING', jobId: response.jobId, startedAt } );
			} catch {
				dispatch( { type: 'FAILED', error: { code: 'queue-failed', message: null } } );
			}
		},
		[ siteId ]
	);

	const reset = useCallback( () => {
		clearStored( siteId );
		dispatch( { type: 'RESET' } );
	}, [ siteId ] );

	return {
		status: state.status,
		jobId: state.jobId,
		result: state.result,
		error: state.error,
		generate,
		reset,
	};
}
