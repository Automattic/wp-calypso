/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { type Mock, vi } from 'vitest';
import { setupRedirectRoutes } from '../utils';

vi.mock( '@automattic/calypso-router', () => {
	const page = Object.assign( vi.fn(), { redirect: vi.fn() } );
	return {
		__esModule: true,
		default: page,
	};
} );

describe( 'setupRedirectRoutes', () => {
	beforeEach( () => {
		vi.mocked( page ).mockClear();
		vi.mocked( page.redirect ).mockClear();
	} );

	it( 'stops the middleware chain after a regex redirect matches', () => {
		setupRedirectRoutes( [
			{
				path: '/reader/feeds/:feed_id/posts',
				regex: /^\/reader\/feeds\/([0-9]+)\/posts$/i,
				getRedirect: ( params ) => `/reader/feeds/${ params?.feed_id }`,
			},
		] );

		const pageMock = page as unknown as Mock;
		const handler = pageMock.mock.calls[ 0 ][ 1 ] as (
			context: { path: string; params: Record< string, string > },
			next: () => void
		) => void;
		const next = vi.fn();

		handler( { path: '/reader/feeds/123/posts', params: { feed_id: '123' } }, next );

		expect( page.redirect ).toHaveBeenCalledWith( '/reader/feeds/123' );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
