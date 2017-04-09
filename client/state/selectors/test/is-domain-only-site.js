/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDomainOnlySite } from '../';

describe( '#isDomainOnlySite()', () => {
	const siteId = 77203074;

	it( 'should return null if the site is unknown', () => {
		const result = isDomainOnlySite( {
			sites: {
				items: {}
			}
		}, siteId );

		expect( result ).to.be.null;
	} );

	it( 'it should return false if the site does not have the domain only option set to true', () => {
		const result = isDomainOnlySite( {
			sites: {
				items: {
					[ siteId ]: { ID: siteId, URL: 'https://example.wordpress.com', options: {
						is_domain_only: false
					} }
				}
			}
		}, siteId );

		expect( result ).to.be.false;
	} );

	it( 'it should return false if the site has the domain only option set to true', () => {
		const result = isDomainOnlySite( {
			sites: {
				items: {
					[ siteId ]: { ID: siteId, URL: 'https://example.wordpress.com', options: {
						is_domain_only: true
					} }
				}
			}
		}, siteId );

		expect( result ).to.be.true;
	} );
} );
