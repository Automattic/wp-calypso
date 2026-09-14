/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { setupRedirectRoutes } from '../utils';

jest.mock( '@automattic/calypso-router', () => {
	const page = Object.assign( jest.fn(), { redirect: jest.fn() } );
	return {
		__esModule: true,
		default: page,
	};
} );

describe( 'setupRedirectRoutes', () => {
	beforeEach( () => {
		jest.mocked( page ).mockClear();
		jest.mocked( page.redirect ).mockClear();
	} );

	it( 'stops the middleware chain after a regex redirect matches', () => {
		setupRedirectRoutes( [
			{
				path: '/reader/feeds/:feed_id/posts',
				regex: /^\/reader\/feeds\/([0-9]+)\/posts$/i,
				getRedirect: ( params ) => `/reader/feeds/${ params?.feed_id }`,
			},
		] );

		const pageMock = page as unknown as jest.Mock;
		const handler = pageMock.mock.calls[ 0 ][ 1 ] as (
			context: { path: string; params: Record< string, string > },
			next: () => void
		) => void;
		const next = jest.fn();

		handler( { path: '/reader/feeds/123/posts', params: { feed_id: '123' } }, next );

		expect( page.redirect ).toHaveBeenCalledWith( '/reader/feeds/123' );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
