import {
	approveStaticSiteImportSession,
	attachSwitchRun,
	createSwitchRun,
	fetchStaticSiteImportSession,
	fetchSwitchRun,
	fetchSwitchRunPreview,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type {
	ApproveStaticSiteImportSessionParams,
	AttachSwitchRunParams,
} from '@automattic/api-core';

export const switchRunQuery = ( runId: string ) =>
	queryOptions( {
		queryKey: [ 'switch-run', runId ],
		queryFn: () => fetchSwitchRun( runId ),
	} );

export const switchRunPreviewQuery = ( runId: string ) =>
	queryOptions( {
		queryKey: [ 'switch-run', runId, 'preview' ],
		queryFn: () => fetchSwitchRunPreview( runId ),
	} );

export const staticSiteImportSessionQuery = ( siteId: number, sessionId: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'static-site-import-session', sessionId ],
		queryFn: () => fetchStaticSiteImportSession( siteId, sessionId ),
	} );

export const createSwitchRunMutation = () =>
	mutationOptions( {
		meta: { statId: 'switch-run-create' },
		mutationFn: ( sourceUrl: string ) => createSwitchRun( sourceUrl ),
		onSuccess: ( run ) => {
			queryClient.setQueryData( switchRunQuery( run.run_id ).queryKey, run );
		},
	} );

export const attachSwitchRunMutation = () =>
	mutationOptions( {
		meta: { statId: 'switch-run-attach' },
		mutationFn: ( params: AttachSwitchRunParams ) => attachSwitchRun( params ),
		onSuccess: ( run ) => {
			queryClient.setQueryData( switchRunQuery( run.run_id ).queryKey, run );
		},
	} );

export const approveStaticSiteImportSessionMutation = () =>
	mutationOptions( {
		meta: { statId: 'site-import-approve' },
		mutationFn: ( params: ApproveStaticSiteImportSessionParams ) =>
			approveStaticSiteImportSession( params ),
		onSuccess: ( session, { siteId } ) => {
			queryClient.setQueryData(
				staticSiteImportSessionQuery( siteId, session.session_id ).queryKey,
				session
			);
		},
	} );
