/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCurrentOAuth2Client, showOAuth2Layout } from '../selectors';

describe( 'selectors', () => {
	describe( 'getCurrentOAuth2Client()', () => {
		test( 'should return null if there is no information yet', () => {
			const clientData = getCurrentOAuth2Client( undefined );

			expect( clientData ).to.be.null;
		} );

		test( 'should return the oauth2 client information if there is one', () => {
			const clientData = getCurrentOAuth2Client( {
				oauth2Clients: {
					1: {
						id: 1,
						name: 'test',
						title: 'WordPress.com Test Client',
						url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
					},
				},
				ui: {
					oauth2Clients: {
						currentClientId: 1,
					},
				},
			} );

			expect( clientData ).to.deep.equal( {
				id: 1,
				name: 'test',
				title: 'WordPress.com Test Client',
				url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
			} );
		} );
	} );

	describe( 'showOAuth2Layout()', () => {
		test( 'should return false if there is no information yet', () => {
			const showOAuth2 = showOAuth2Layout( undefined );

			expect( showOAuth2 ).to.be.false;
		} );

		test( 'should return false if there is no current oauth2 client set', () => {
			const showOAuth2 = showOAuth2Layout( {
				oauth2Clients: {
					1: {
						id: 1,
						name: 'test',
						title: 'WordPress.com Test Client',
						url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
					},
				},
				ui: {
					oauth2Clients: {
						currentClientId: undefined,
					},
				},
			} );

			expect( showOAuth2 ).to.be.false;
		} );

		test( 'should return true if there is a current client id set', () => {
			const showOAuth2 = showOAuth2Layout( {
				oauth2Clients: {
					1: {
						id: 1,
						name: 'test',
						title: 'WordPress.com Test Client',
						url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg',
					},
				},
				ui: {
					oauth2Clients: {
						currentClientId: 42,
					},
				},
			} );

			expect( showOAuth2 ).to.be.true;
		} );
	} );
} );
