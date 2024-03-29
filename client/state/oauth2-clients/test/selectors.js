import { getOAuth2Client } from '../selectors';

describe( 'selectors', () => {
	describe( 'getOAuth2Client()', () => {
		test( 'should return null if empty state provided', () => {
			const client = getOAuth2Client( { oauth2Clients: { clients: {} } } );

			expect( client ).toBeNull();
		} );

		test( 'should return null if wrong client id provided', () => {
			const client = getOAuth2Client(
				{
					oauth2Clients: {
						clients: {
							1: {
								id: 1,
								name: 'test',
								title: 'WordPress.com Test Client',
								url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
							},
						},
					},
				},
				2
			);

			expect( client ).toBeNull();
		} );

		test( 'should return data', () => {
			const client = getOAuth2Client(
				{
					oauth2Clients: {
						clients: {
							1: {
								id: 1,
								name: 'test',
								title: 'WordPress.com Test Client',
								url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
							},
						},
					},
				},
				1
			);

			expect( client ).toEqual( {
				id: 1,
				name: 'test',
				title: 'WordPress.com Test Client',
				url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
			} );
		} );
	} );
} );
