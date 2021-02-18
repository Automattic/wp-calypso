/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';

describe( 'hasJetpackSites()', () => {
	test( 'it should return false if sites are empty', () => {
		expect(
			hasJetpackSites( {
				sites: {
					items: {},
				},
			} )
		).to.be.false;
	} );

	test( 'it should return false if one site exists and the site is not a Jetpack site', () => {
		expect(
			hasJetpackSites( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.wordpress.com', jetpack: false },
					},
				},
			} )
		).to.be.false;
	} );

	test( 'it should return false if several sites exist and none of them is a Jetpack site', () => {
		expect(
			hasJetpackSites( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.wordpress.com', jetpack: false },
						12203074: { ID: 12203074, URL: 'https://example2.wordpress.com', jetpack: false },
						32203074: { ID: 32203074, URL: 'https://test.wordpress.com', jetpack: false },
					},
				},
			} )
		).to.be.false;
	} );

	test( 'it should return true if one site is a Jetpack site and the others are not', () => {
		expect(
			hasJetpackSites( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.wordpress.com', jetpack: false },
						12203074: { ID: 12203074, URL: 'https://example2.jetpack.com', jetpack: true },
						32203074: { ID: 32203074, URL: 'https://test.wordpress.com', jetpack: false },
					},
				},
			} )
		).to.be.true;
	} );

	test( 'it should return true if several sites exist and all of them are Jetpack sites', () => {
		expect(
			hasJetpackSites( {
				sites: {
					items: {
						77203074: { ID: 77203074, URL: 'https://example.jetpack.com', jetpack: true },
						12203074: { ID: 12203074, URL: 'https://example2.jetpack.com', jetpack: true },
						32203074: { ID: 32203074, URL: 'https://test.jetpack.com', jetpack: true },
					},
				},
			} )
		).to.be.true;
	} );
} );
