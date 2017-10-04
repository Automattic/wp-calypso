/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteOptions } from '../';
import { userState } from './fixtures/user-state';

describe( 'getSiteOptions()', () => {
	it( 'should return null if site is not found', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
		};
		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).to.be.null;
	} );

	it( 'should return default options object if no options are found', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: { ID: 2916288, name: 'WordPress.com Example Blog' },
				},
			},
		};

		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).to.eql( {
			default_post_format: 'standard',
		} );
	} );

	it( 'should return the options of the site if they exist with default_post_format added if it was not set', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						options: {
							option1: 'ok',
						},
					},
				},
			},
		};

		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).to.eql( {
			default_post_format: 'standard',
			option1: 'ok',
		} );
	} );

	it( 'should return the options of the site with correct default_post_format added if it was set to 0', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						options: {
							option1: 'ok',
							default_post_format: '0',
						},
					},
				},
			},
		};

		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).to.eql( {
			default_post_format: 'standard',
			option1: 'ok',
		} );
	} );

	it( 'should return the options of the site if they exist', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						options: {
							option2: 'not-ok',
							default_post_format: 'test',
						},
					},
				},
			},
		};

		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).to.eql( {
			default_post_format: 'test',
			option2: 'not-ok',
		} );
	} );
} );
