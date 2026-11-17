/**
 * @vitest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { APP_CONTEXT_DEFAULT_CONFIG, type AppConfig } from '../../context';
import { getRouter } from '../index';
import { notificationsRoute } from '../notifications';

const dashboardConfig = ( notifications: boolean ): AppConfig => ( {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, notifications },
} );

const matchedRouteId = ( appConfig: AppConfig, pathname: string ) =>
	getRouter( appConfig ).getMatchedRoutes( pathname )[ 0 ].at( -1 )?.id;

describe( 'notifications routes', () => {
	afterEach( () => {
		config.disable( 'dashboard/notifications-inbox' );
	} );

	test( 'serve the inbox and its notes when the flag is on', () => {
		config.enable( 'dashboard/notifications-inbox' );

		expect( matchedRouteId( dashboardConfig( true ), '/notifications' ) ).toBe( '/notifications/' );
		expect( matchedRouteId( dashboardConfig( true ), '/notifications/123' ) ).toBe(
			'/notifications/$noteId'
		);
	} );

	test( 'leave the inbox address unmatched when the flag is off', () => {
		config.disable( 'dashboard/notifications-inbox' );

		expect( matchedRouteId( dashboardConfig( true ), '/notifications' ) ).toBe( '/$' );
		expect( matchedRouteId( dashboardConfig( true ), '/notifications/123' ) ).toBe( '/$' );
	} );

	test( 'leave the inbox address unmatched in a dashboard without notifications', () => {
		config.enable( 'dashboard/notifications-inbox' );

		expect( matchedRouteId( dashboardConfig( false ), '/notifications' ) ).toBe( '/$' );
	} );

	test( 'keep only the Unread filter from the address', () => {
		const validateSearch = notificationsRoute.options.validateSearch as (
			search: Record< string, unknown >
		) => unknown;

		expect( validateSearch( { filter: 'unread' } ) ).toEqual( { filter: 'unread' } );
		expect( validateSearch( { filter: 'comments' } ) ).toEqual( { filter: undefined } );
	} );
} );
