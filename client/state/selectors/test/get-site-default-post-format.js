/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteDefaultPostFormat from 'calypso/state/selectors/get-site-default-post-format';

describe( 'getSiteDefaultPostFormat()', () => {
	const siteId = 2916284;

	test( 'should return default post format for a known site when settings have not been fetched', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							default_post_format: 'image',
						},
					},
				},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'image' );
	} );

	test( 'should return default post format when settings have been fetched and site is unknown', () => {
		const state = {
			siteSettings: {
				items: {
					[ siteId ]: {
						default_post_format: 'aside',
					},
				},
			},
			sites: {
				items: {},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'aside' );
	} );

	test( 'should prioritize default post format from settings over post format from sites', () => {
		const state = {
			siteSettings: {
				items: {
					[ siteId ]: {
						default_post_format: 'aside',
					},
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							default_post_format: 'image',
						},
					},
				},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'aside' );
	} );

	test( 'should return standard if post format is set to 0', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							default_post_format: '0',
						},
					},
				},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'standard' );
	} );

	test( 'should return standard if post format is set to an empty string', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							default_post_format: '',
						},
					},
				},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'standard' );
	} );

	test( 'should return standard if post format is missing for a known site', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							exampleOption: 'exampleValue',
						},
					},
				},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'standard' );
	} );

	test( 'should return standard if settings are fetched, but post format option is missing', () => {
		const state = {
			siteSettings: {
				items: {
					[ siteId ]: {
						options: {
							some_option: 'example',
						},
					},
				},
			},
			sites: {
				items: {},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'standard' );
	} );

	test( 'should return null for an unknown site when settings have not been fetched', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					77203074: {
						options: {
							default_post_format: 'image',
						},
					},
				},
			},
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.be.null;
	} );
} );
