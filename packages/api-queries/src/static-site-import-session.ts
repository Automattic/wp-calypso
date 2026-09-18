import {
	approveStaticSiteImportSession,
	createStaticSiteImportSession,
	fetchStaticSiteImportSession,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
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
	} );

export const pollStaticSiteImportSessionUntil =
	( states: readonly StaticSiteImportState[] ) =>
	( query: { state: { data?: StaticSiteImportSession } } ) => {
		const state = query.state.data?.state;
		return state && states.includes( state ) ? false : POLL_INTERVAL;
	};

export const createStaticSiteImportSessionMutation = () =>
	mutationOptions( {
		meta: { statId: 'static-site-import-session-create' },
		mutationFn: ( sourceUrl: string ) => createStaticSiteImportSession( sourceUrl ),
		onSuccess: ( session ) => {
			queryClient.setQueryData(
				staticSiteImportSessionQuery( session.session_id ).queryKey,
				session
			);
		},
	} );

export const approveStaticSiteImportSessionMutation = () =>
	mutationOptions( {
		meta: { statId: 'static-site-import-session-approve' },
		mutationFn: ( params: ApproveStaticSiteImportSessionParams ) =>
			approveStaticSiteImportSession( params ),
		onSuccess: ( session ) => {
			queryClient.setQueryData(
				staticSiteImportSessionQuery( session.session_id ).queryKey,
				session
			);
		},
	} );
