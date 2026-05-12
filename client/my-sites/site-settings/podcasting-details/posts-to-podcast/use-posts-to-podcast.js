import { useCallback, useReducer } from 'react';
import wpcom from 'calypso/lib/wp';

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
