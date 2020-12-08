/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	CONNECTED_APPLICATION_DELETE_SUCCESS,
	CONNECTED_APPLICATIONS_RECEIVE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	const app1 = {
		ID: '12345678',
		URL: 'http://wordpress.com',
		authorized: '2018-01-01T00:00:00+00:00',
		description: 'Example description of the application here',
		icon: 'https://wordpress.com/calypso/images/wordpress/logo-stars.svg',
		permissions: [
			{
				name: 'follow',
				description: 'Follow and unfollow blogs.',
			},
			{
				name: 'posts',
				description: 'View and manage posts including reblogs and likes.',
			},
		],
		scope: 'global',
		site: {
			site_ID: '87654321',
			site_URL: 'http://wordpress.com',
			site_name: 'WordPress',
		},
		title: 'WordPress',
	};
	const app2 = {
		...app1,
		ID: '23456789',
	};

	const apps = [ app1, app2 ];
	const otherApps = [
		{
			...app1,
			ID: '87654321',
		},
	];

	test( 'should default to null', () => {
		const state = reducer( undefined, {} );
		expect( state ).toBeNull();
	} );

	test( 'should set connected applications to empty array when user has no connected applications', () => {
		const state = reducer( undefined, {
			type: CONNECTED_APPLICATIONS_RECEIVE,
			apps: [],
		} );

		expect( state ).toEqual( [] );
	} );

	test( 'should add connected applications to the initial state', () => {
		const state = reducer( [], {
			type: CONNECTED_APPLICATIONS_RECEIVE,
			apps,
		} );

		expect( state ).toEqual( apps );
	} );

	test( 'should overwrite previous connected applications in state', () => {
		const state = deepFreeze( apps );
		const newState = reducer( state, {
			type: CONNECTED_APPLICATIONS_RECEIVE,
			apps: otherApps,
		} );

		expect( newState ).toEqual( otherApps );
	} );

	test( 'should delete connected applications by ID from state', () => {
		const state = deepFreeze( apps );
		const newState = reducer( state, {
			type: CONNECTED_APPLICATION_DELETE_SUCCESS,
			appId: app1.ID,
		} );

		expect( newState ).toEqual( [ app2 ] );
	} );
} );
