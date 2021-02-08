/**
 * Internal dependencies
 */

import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestFetchAdminMenu, handleSuccess } from '../';
import { requestAdminMenu, receiveAdminMenu } from 'calypso/state/admin-menu/actions';

describe( 'requestFetchAdminMenu', () => {
	test( 'should create the correct http request action', () => {
		const action = requestAdminMenu( 73738 );
		const output = requestFetchAdminMenu( action );
		expect( output ).toEqual(
			http(
				{
					method: 'GET',
					path: '/sites/73738/admin-menu/',
					apiNamespace: 'wpcom/v2',
				},
				action
			)
		);
	} );
} );

describe( 'handlers', () => {
	test( 'should create correct success action on fetch success ', () => {
		const dispatch = jest.fn();
		const getState = () => ( {
			currentUser: { capabilities: { 73738: {} } },
			sites: { items: { 73738: { ID: 73738, domain: 'example.wordpress.com' } } },
		} );
		const menuData = {};
		const action = receiveAdminMenu( 73738, menuData );
		handleSuccess( { siteId: 73738 }, menuData )( dispatch, getState );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( action ) );
	} );

	test( 'should sanitize menu URLs', () => {
		const dispatch = jest.fn();
		const getState = () => ( {
			currentUser: { capabilities: { 73738: {} } },
			sites: { items: { 73738: { ID: 73738, domain: 'example.wordpress.com' } } },
		} );
		const unsafeMenu = [
			{
				icon: 'dashicons-warning',
				slug: 'my-custom-menu',
				title: 'Click here',
				type: 'menu-item',
				url: 'javascript:alert("hello")',
				children: [
					{
						parent: 'my-custom-menu',
						slug: 'my-custom-menu-2',
						title: 'Or here',
						type: 'submenu-item',
						url: 'http://example.com',
					},
				],
			},
		];
		const sanitizedMenu = [ ...unsafeMenu ];
		sanitizedMenu[ 0 ].url = '';
		sanitizedMenu[ 0 ].children[ 0 ].url = '';
		const action = receiveAdminMenu( 73738, sanitizedMenu );

		handleSuccess( { siteId: 73738 }, unsafeMenu )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( action ) );
	} );
} );
