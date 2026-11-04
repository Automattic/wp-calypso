import {
	approveStaticSiteImportSession,
	createStaticSiteImportSession,
	fetchStaticSiteImportSession,
	isWpError,
	requestStaticSiteImportHandoff,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type {
	ApproveStaticSiteImportSessionParams,
	StaticSiteImportHandoffParams,
	StaticSiteImportSession,
	StaticSiteImportState,
} from '@automattic/api-core';

const POLL_INTERVAL = 5000;
const CREATE_TIMEOUT = 60000;

export const staticSiteImportSessionQuery = ( sessionId: string ) =>
	queryOptions( {
		queryKey: [ 'static-site-import-session', sessionId ],
		queryFn: () => fetchStaticSiteImportSession( sessionId ),
		meta: { persist: false },
	} );

/** A 4xx will not change by asking again; anything else is worth another try. */
export const isPermanentStaticSiteImportError = ( error: unknown ) =>
	isWpError( error ) && error.status < 500;

export const pollStaticSiteImportSessionUntil =
	( states: readonly StaticSiteImportState[] ) =>
	( query: { state: { data?: StaticSiteImportSession; error?: unknown } } ) => {
		if ( isPermanentStaticSiteImportError( query.state.error ) ) {
			return false;
		}
		const state = query.state.data?.state;
		return state && states.includes( state ) ? false : POLL_INTERVAL;
	};

export const createStaticSiteImportSessionMutation = () =>
	mutationOptions( {
		meta: { statId: 'static-site-import-create' },
		// A mutation paused while offline never runs, so it would never reach the timeout.
		networkMode: 'always',
		mutationFn: ( sourceUrl: string ) => {
			let timer: ReturnType< typeof setTimeout >;
			const timeout = new Promise< never >( ( _resolve, reject ) => {
				timer = setTimeout(
					() => reject( new Error( 'Creating the import session timed out' ) ),
					CREATE_TIMEOUT
				);
			} );
			return Promise.race( [ createStaticSiteImportSession( sourceUrl ), timeout ] ).finally( () =>
				clearTimeout( timer )
			);
		},
	} );

export const approveStaticSiteImportSessionMutation = () =>
	mutationOptions( {
		meta: { statId: 'static-site-import-approve' },
		mutationFn: ( params: ApproveStaticSiteImportSessionParams ) =>
			approveStaticSiteImportSession( params ),
	} );

export const staticSiteImportHandoffMutation = () =>
	mutationOptions( {
		meta: { statId: 'static-site-import-handoff' },
		mutationFn: ( params: StaticSiteImportHandoffParams ) =>
			requestStaticSiteImportHandoff( params ),
	} );
