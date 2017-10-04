/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteUrl } from '..';

describe( 'getSiteUrl()', () => {
	it( 'should return null if the site is unknown', () => {
		const state = {
			sites: {
				items: {
					456: { URL: 'https://wordpress.com' },
				},
			},
		};

		expect( getSiteUrl( state ) ).to.be.null;
		expect( getSiteUrl( state, 123 ) ).to.be.null;
	} );

	it( 'should return null if the Url is unknown', () => {
		const state = {
			sites: {
				items: {
					123: {},
					456: { URL: 'https://wordpress.com' },
				},
			},
		};
		expect( getSiteUrl( state, 123 ) ).to.be.null;
	} );

	it( 'should return the Url for a site', () => {
		const URL = 'https://wordpress.com';
		const result = getSiteUrl(
			{
				sites: {
					items: {
						123: {
							URL,
						},
					},
				},
			},
			123
		);

		expect( result ).to.equal( URL );
	} );
} );
