import { WOO_TRACKS_MESSAGE_TYPE, parseWooTracksMessage } from '../lib/woo-tracks';

describe( 'parseWooTracksMessage', () => {
	const message = ( event: unknown, properties?: unknown ) => ( {
		type: WOO_TRACKS_MESSAGE_TYPE,
		event,
		properties,
	} );

	it.each( [
		[ 'wcadmin_page_view', { path: 'wc-admin' }, 'calypso_playground_woo_page_view' ],
		[ 'wcadmin_task_view', { task_name: 'products' }, 'calypso_playground_woo_task_view' ],
	] )( 'maps %s to its Calypso event', ( event, properties, name ) => {
		expect( parseWooTracksMessage( message( event, properties ) ) ).toEqual( { name, properties } );
	} );

	it.each( [
		[ 'a WooCommerce page', 'analytics_overview', 'analytics_overview' ],
		[
			'a classic page, without the Playground scope',
			'/scope:5647dffc-7eec/wp-admin/admin.php?page=wc-settings&tab=checkout&from=WCADMIN_PAYMENT_TASK',
			'/wp-admin/admin.php?page=wc-settings&tab=checkout&from=WCADMIN_PAYMENT_TASK',
		],
	] )( 'records the path of %s', ( _name, path, expected ) => {
		expect( parseWooTracksMessage( message( 'wcadmin_page_view', { path } ) ) ).toEqual( {
			name: 'calypso_playground_woo_page_view',
			properties: { path: expected },
		} );
	} );

	it( 'keeps only the property each event allows', () => {
		expect(
			parseWooTracksMessage(
				message( 'wcadmin_page_view', { path: 'wc-admin', task_name: 'products', email: 'x' } )
			)
		).toEqual( {
			name: 'calypso_playground_woo_page_view',
			properties: { path: 'wc-admin' },
		} );
	} );

	it.each( [
		[ 'no data', undefined ],
		[ 'a string', 'wcadmin_page_view' ],
		[
			'another message type',
			{ type: 'other', event: 'wcadmin_page_view', properties: { path: 'a' } },
		],
		[ 'an unknown event', message( 'wcadmin_products_view', { path: 'a' } ) ],
		[ 'no properties', message( 'wcadmin_page_view' ) ],
		[ 'a missing property', message( 'wcadmin_task_view', { path: 'a' } ) ],
		[ 'an empty property', message( 'wcadmin_page_view', { path: '' } ) ],
		[ 'a property that is not a string', message( 'wcadmin_page_view', { path: { a: 1 } } ) ],
		[
			'a path with only the Playground scope',
			message( 'wcadmin_page_view', { path: '/scope:abc' } ),
		],
		[ 'a path that is too long', message( 'wcadmin_page_view', { path: 'a'.repeat( 201 ) } ) ],
		[ 'a task name with spaces', message( 'wcadmin_task_view', { task_name: 'my products' } ) ],
		[ 'markup', message( 'wcadmin_page_view', { path: '<img src=x onerror=alert(1)>' } ) ],
	] )( 'ignores %s', ( _name, data ) => {
		expect( parseWooTracksMessage( data ) ).toBeNull();
	} );
} );
