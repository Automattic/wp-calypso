/**
 * @jest-environment jsdom
 */

import { addQueryArgs } from 'calypso/lib/url';
import { requestAdminMenu, receiveAdminMenu } from 'calypso/state/admin-menu/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestFetchAdminMenu, handleSuccess } from '../';

describe( 'requestFetchAdminMenu', () => {
	test( 'should create the correct http request action', () => {
		const action = requestAdminMenu( 73738 );
		const output = requestFetchAdminMenu( action );
		expect( output ).toEqual(
			http(
				{
					method: 'GET',
					path: '/sites/73738/admin-menu/?_locale=user',
					apiNamespace: 'wpcom/v2',
				},
				action
			)
		);
	} );
} );

describe( 'handlers', () => {
	const getState = () => ( {
		sites: {
			items: { 73738: { options: { admin_url: 'https://example.wordpress.com/wp-admin' } } },
		},
	} );

	test( 'should create correct success action on fetch success', () => {
		const dispatch = jest.fn();
		const menuData = {};
		const action = receiveAdminMenu( 73738, menuData );
		handleSuccess( { siteId: 73738 }, menuData )( dispatch, getState );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( action ) );
	} );

	test( 'should sanitize menu URLs', () => {
		const dispatch = jest.fn();
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
			{
				icon: 'dashicons-default',
				slug: 'my-custom-menu-3',
				title: 'Home',
				type: 'menu-item',
				url: '/home',
				children: [
					{
						parent: 'my-custom-menu-3',
						slug: 'my-custom-menu-3',
						title: 'Settings',
						type: 'submenu-item',
						url: 'https://example.wordpress.com/wp-admin/settings.php',
					},
					{
						parent: 'my-custom-menu-4',
						slug: 'my-custom-menu-4',
						title: 'Malicious Child',
						type: 'submenu-item',
						url: 'javascript:alert("not good")',
					},
				],
			},
		];
		const sanitizedMenu = [ ...unsafeMenu ];
		sanitizedMenu[ 0 ].url = '';
		sanitizedMenu[ 0 ].children[ 0 ].url = '';
		sanitizedMenu[ 1 ].children[ 0 ].url = addQueryArgs(
			{
				return: document.location.href,
			},
			sanitizedMenu[ 1 ].children[ 0 ].url
		);
		sanitizedMenu[ 1 ].children[ 1 ].url = '';
		const action = receiveAdminMenu( 73738, sanitizedMenu );

		handleSuccess( { siteId: 73738 }, unsafeMenu )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( action ) );
	} );
} );
