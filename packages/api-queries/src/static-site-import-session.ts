import {
	approveStaticSiteImportSession,
	createStaticSiteImportSession,
	fetchStaticSiteImportSession,
	isWpError,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type {
	ApproveStaticSiteImportSessionParams,
	StaticSiteImportSession,
	StaticSiteImportState,
} from '@automattic/api-core';

const POLL_INTERVAL = 5000;

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
		mutationFn: ( sourceUrl: string ) => createStaticSiteImportSession( sourceUrl ),
	} );

export const approveStaticSiteImportSessionMutation = () =>
	mutationOptions( {
		meta: { statId: 'static-site-import-approve' },
		mutationFn: ( params: ApproveStaticSiteImportSessionParams ) =>
			approveStaticSiteImportSession( params ),
	} );
