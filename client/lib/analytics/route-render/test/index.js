import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordRouteRender } from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

describe( 'recordRouteRender', () => {
	beforeEach( () => {
		recordTracksEvent.mockClear();
	} );

	test( 'records the matched route pattern and the section, never the concrete path', () => {
		recordRouteRender( {
			currentRoutePattern: '/accept-invite/:site/:invitation_key',
			pathname: '/accept-invite/example.wordpress.com/secret-key',
			section: { name: 'accept-invite' },
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_route_render', {
			app: 'calypso',
			path: '/accept-invite/:site/:invitation_key',
			section: 'accept-invite',
		} );
	} );

	test( 'records a placeholder when no route pattern was recorded', () => {
		recordRouteRender( { pathname: '/sites', section: { name: 'sites-dashboard' } } );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_route_render', {
			app: 'calypso',
			path: '(unmatched)',
			section: 'sites-dashboard',
		} );
	} );

	test( 'counts a context that renders more than once only once', () => {
		const context = { currentRoutePattern: '/me', section: { name: 'me' } };

		recordRouteRender( context );
		recordRouteRender( context );
		recordRouteRender( { ...context } );

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
	} );
} );
