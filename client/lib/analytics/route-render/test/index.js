import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordRouteRender } from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

describe( 'recordRouteRender', () => {
	beforeEach( () => {
		recordTracksEvent.mockClear();
	} );

	test( 'records the matched route pattern, the pathname, and the section', () => {
		recordRouteRender( {
			routePath: '/plans/:site?',
			pathname: '/plans/example.wordpress.com',
			section: { name: 'plans' },
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_route_render', {
			app: 'calypso',
			path: '/plans/:site?',
			pathname: '/plans/example.wordpress.com',
			section: 'plans',
		} );
	} );

	test( 'falls back to the pathname when no string route matched', () => {
		recordRouteRender( { pathname: '/sites', section: { name: 'sites-dashboard' } } );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_route_render',
			expect.objectContaining( { path: '/sites', pathname: '/sites' } )
		);
	} );

	test( 'counts a context that renders more than once only once', () => {
		const context = { routePath: '/me', pathname: '/me', section: { name: 'me' } };

		recordRouteRender( context );
		recordRouteRender( context );
		recordRouteRender( { ...context } );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
	} );
} );
