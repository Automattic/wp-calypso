/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isMappedDomainSite } from '../';

describe( '#isMappedDomainSite()', () => {
	const siteId = 77203074;

	it( 'should return null if the site is unknown', () => {
		const result = isMappedDomainSite( {
			sites: {
				items: {}
			}
		}, siteId );

		expect( result ).to.be.null;
	} );

	it( 'it should return false if the site does not have the mapped domain option set to true', () => {
		const result = isMappedDomainSite( {
			sites: {
				items: {
					[ siteId ]: { ID: siteId, URL: 'https://example.wordpress.com', options: {
						is_mapped_domain: false
					} }
				}
			}
		}, siteId );

		expect( result ).to.be.false;
	} );

	it( 'it should return false if the site has the mapped domain option set to true', () => {
		const result = isMappedDomainSite( {
			sites: {
				items: {
					[ siteId ]: { ID: siteId, URL: 'https://example.wordpress.com', options: {
						is_mapped_domain: true
					} }
				}
			}
		}, siteId );

		expect( result ).to.be.true;
	} );
} );
