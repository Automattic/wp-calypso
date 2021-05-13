/**
 * Internal dependencies
 */
import { apiTransformer, handleRequestSuccess, requestConnectedApplications } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { receiveConnectedApplications } from 'calypso/state/connected-applications/actions';

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

describe( 'requestConnectedApplications()', () => {
	test( 'should return an action for HTTP request to request the connected applications', () => {
		const action = requestConnectedApplications();

		expect( action ).toEqual(
			http( {
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/connected-applications',
			} )
		);
	} );
} );

describe( 'handleRequestSuccess()', () => {
	test( 'should return a connected applications receive action', () => {
		const action = handleRequestSuccess( null, apps );

		expect( action ).toEqual( receiveConnectedApplications( apps ) );
	} );
} );

describe( 'apiTransformer()', () => {
	test( 'should transform original response for a successful request', () => {
		expect( apiTransformer( { connected_applications: apps } ) ).toEqual( apps );
	} );
} );
