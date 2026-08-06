import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type StaticSiteImportState = 'preview_ready' | 'queued' | 'applying' | 'finished' | 'failed';

export type StaticSiteImportSession = {
	session_id: string;
	plan_hash?: string;
	status: string;
	state: StaticSiteImportState;
	source_digest?: string;
	preview_summary?: Record< string, number >;
};

const queryKey = ( siteId: number, sessionId: string ) => [
	'static-site-import-session',
	siteId,
	sessionId,
];

const createSession = ( siteId: number, sourceUrl: string ) =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/static-site-import-session`,
		apiNamespace: 'wpcom/v2',
		body: { source_url: sourceUrl },
	} ) as Promise< StaticSiteImportSession >;

const fetchSession = ( siteId: number, sessionId: string ) =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/static-site-import-session/${ sessionId }`,
		apiNamespace: 'wpcom/v2',
	} ) as Promise< StaticSiteImportSession >;

const approveSession = ( siteId: number, sessionId: string, planHash: string ) =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/static-site-import-session/${ sessionId }/approve`,
		apiNamespace: 'wpcom/v2',
		body: { plan_hash: planHash },
	} ) as Promise< StaticSiteImportSession >;

export const useStaticSiteImportSession = ( siteId: number, sessionId?: string ) =>
	useQuery( {
		queryKey: queryKey( siteId, sessionId ?? '' ),
		queryFn: () => fetchSession( siteId, sessionId! ),
		enabled: siteId > 0 && Boolean( sessionId ),
		refetchInterval: ( query ) =>
			[ 'finished', 'failed' ].includes( query.state.data?.state ?? '' ) ? false : 5000,
		refetchIntervalInBackground: true,
		retry: 3,
	} );

export const useCreateStaticSiteImportSession = () =>
	useMutation( {
		mutationFn: ( { siteId, sourceUrl }: { siteId: number; sourceUrl: string } ) =>
			createSession( siteId, sourceUrl ),
	} );

export const useApproveStaticSiteImportSession = () => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( {
			siteId,
			sessionId,
			planHash,
		}: {
			siteId: number;
			sessionId: string;
			planHash: string;
		} ) => approveSession( siteId, sessionId, planHash ),
		onSuccess: ( session, variables ) => {
			queryClient.setQueryData( queryKey( variables.siteId, variables.sessionId ), session );
		},
	} );
};
