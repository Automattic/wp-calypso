/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import {
	useApproveStaticSiteImportSession,
	useCreateStaticSiteImportSession,
	useStaticSiteImportSession,
} from '../use-static-site-import-session';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn(), post: jest.fn() } },
} ) );

const wrapper = ( { children }: React.PropsWithChildren ) => (
	<QueryClientProvider client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }>
		{ children }
	</QueryClientProvider>
);

describe( 'static site import session API', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'creates a preview from the source URL', async () => {
		jest.mocked( wpcom.req.post ).mockResolvedValue( {
			session_id: 'session-1',
			plan_hash: 'hash-1',
			status: 'pending',
			state: 'preview_ready',
			preview_summary: { pages: 2 },
		} );
		const { result } = renderHook( useCreateStaticSiteImportSession, { wrapper } );

		await act( () => result.current.mutateAsync( { siteId: 123, sourceUrl: 'https://source.test' } ) );

		expect( wpcom.req.post ).toHaveBeenCalledWith( {
			path: '/sites/123/static-site-import-session',
			apiNamespace: 'wpcom/v2',
			body: { source_url: 'https://source.test' },
		} );
	} );

	it( 'resumes a session and exposes terminal success and failure responses', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValueOnce( {
			session_id: 'session-1',
			status: 'completed',
			state: 'finished',
		} );
		const { result, rerender } = renderHook( () => useStaticSiteImportSession( 123, 'session-1' ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.data?.state ).toBe( 'finished' ) );
		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			path: '/sites/123/static-site-import-session/session-1',
			apiNamespace: 'wpcom/v2',
		} );

		jest.mocked( wpcom.req.get ).mockResolvedValueOnce( {
			session_id: 'session-1',
			status: 'failed',
			state: 'failed',
		} );
		await act( () => result.current.refetch() );
		rerender();
		await waitFor( () => expect( result.current.data?.state ).toBe( 'failed' ) );
	} );

	it( 'approves a session once with its server-issued plan hash', async () => {
		jest.mocked( wpcom.req.post ).mockResolvedValue( {
			session_id: 'session-1',
			status: 'queued',
			state: 'queued',
		} );
		const { result } = renderHook( useApproveStaticSiteImportSession, { wrapper } );

		await act( () =>
			result.current.mutateAsync( { siteId: 123, sessionId: 'session-1', planHash: 'hash-1' } )
		);

		expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
		expect( wpcom.req.post ).toHaveBeenCalledWith( {
			path: '/sites/123/static-site-import-session/session-1/approve',
			apiNamespace: 'wpcom/v2',
			body: { plan_hash: 'hash-1' },
		} );
	} );
} );
