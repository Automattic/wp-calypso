/**
 * Internal dependencies
 */
import {
	deleteConnectedApplication,
	deleteConnectedApplicationSuccess,
	receiveConnectedApplications,
	requestConnectedApplications,
} from '../actions';
import {
	CONNECTED_APPLICATION_DELETE,
	CONNECTED_APPLICATION_DELETE_SUCCESS,
	CONNECTED_APPLICATIONS_RECEIVE,
	CONNECTED_APPLICATIONS_REQUEST,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'requestConnectedApplications()', () => {
		test( 'should return a connected applications request action object', () => {
			const action = requestConnectedApplications();

			expect( action ).toEqual( {
				type: CONNECTED_APPLICATIONS_REQUEST,
			} );
		} );
	} );

	describe( 'receiveConnectedApplications()', () => {
		test( 'should return a connected applications receive action object', () => {
			const apps = [
				{
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
				},
			];
			const action = receiveConnectedApplications( apps );

			expect( action ).toEqual( {
				type: CONNECTED_APPLICATIONS_RECEIVE,
				apps,
			} );
		} );
	} );

	describe( 'deleteConnectedApplication()', () => {
		test( 'should return a connected application delete action object', () => {
			const appId = '12345678';
			const action = deleteConnectedApplication( appId );

			expect( action ).toEqual( {
				type: CONNECTED_APPLICATION_DELETE,
				appId,
			} );
		} );
	} );

	describe( 'deleteConnectedApplicationSuccess()', () => {
		test( 'should return a connected application delete success action object', () => {
			const appId = '12345678';
			const action = deleteConnectedApplicationSuccess( appId );

			expect( action ).toEqual( {
				type: CONNECTED_APPLICATION_DELETE_SUCCESS,
				appId,
			} );
		} );
	} );
} );
