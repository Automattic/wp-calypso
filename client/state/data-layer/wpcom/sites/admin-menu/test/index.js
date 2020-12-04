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
		const menuData = {};
		const action = receiveAdminMenu( 73738, menuData );
		const output = handleSuccess( { siteId: 73738 }, menuData );
		expect( output ).toEqual( action );
	} );
} );
