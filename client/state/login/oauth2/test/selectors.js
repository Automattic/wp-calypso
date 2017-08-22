/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getOAuth2ClientData,
	showOAuth2Layout,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getOAuth2ClientData()', () => {
		it( 'should return null if there is no information yet', () => {
			const clientData = getOAuth2ClientData( undefined );

			expect( clientData ).to.be.null;
		} );

		it( 'should return the oauth2 client information if there is one', () => {
			const clientData = getOAuth2ClientData( {
				login: {
					oauth2: {
						clients: {
							1: {
								id: 1,
								name: 'test',
								title: 'WordPress.com Test Client',
								url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg'
							}
						},
						currentClientId: 1,
					}
				}
			} );

			expect( clientData ).to.deep.equal( {
				id: 1,
				name: 'test',
				title: 'WordPress.com Test Client',
				url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg'
			} );
		} );
	} );

	describe( 'showOAuth2Layout()', () => {
		it( 'should return false if there is no information yet', () => {
			const showOAuth2 = showOAuth2Layout( undefined );

			expect( showOAuth2 ).to.be.false;
		} );

		it( 'should return false if there is no current oauth2 client set', () => {
			const showOAuth2 = showOAuth2Layout( {
				login: {
					oauth2: {
						clients: {
							1: {
								id: 1,
								name: 'test',
								title: 'WordPress.com Test Client',
								url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg'
							}
						},
						currentClientId: undefined,
					}
				}
			} );

			expect( showOAuth2 ).to.be.false;
		} );

		it( 'should return true if there is a current client id set', () => {
			const showOAuth2 = showOAuth2Layout( {
				login: {
					oauth2: {
						clients: {
							1: {
								id: 1,
								name: 'test',
								title: 'WordPress.com Test Client',
								url: 'https://wordpres.com/calypso/images/wordpress/logo-stars.svg'
							}
						},
						currentClientId: 42,
					}
				}
			} );

			expect( showOAuth2 ).to.be.true;
		} );
	} );
} );
