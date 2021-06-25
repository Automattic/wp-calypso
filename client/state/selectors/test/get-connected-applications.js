/**
 * Internal dependencies
 */
import getConnectedApplications from 'calypso/state/selectors/get-connected-applications';

describe( 'getConnectedApplications()', () => {
	test( 'should return connected applications of the current user', () => {
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
		const state = {
			connectedApplications: apps,
		};
		const result = getConnectedApplications( state );
		expect( result ).toBe( apps );
	} );

	test( 'should return null with an empty state', () => {
		const result = getConnectedApplications( undefined );
		expect( result ).toBeNull();
	} );
} );
