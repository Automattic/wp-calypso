/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteDefaultPostFormat } from '../';

describe( 'getSiteDefaultPostFormat()', () => {
	const siteId = 2916284;

	it( 'should return default post format for a known site', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							default_post_format: 'image',
						}
					},
				}
			}
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'image' );
	} );

	it( 'should prioritize default post format from settings', () => {
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
						}
					},
				}
			}
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'aside' );
	} );

	it( 'should return standard if post format is set to 0', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							default_post_format: '0',
						}
					},
				}
			}
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'standard' );
	} );

	it( 'should return standard if post format is missing for a known site', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						options: {
							exampleOption: 'exampleValue',
						}
					},
				}
			}
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.eql( 'standard' );
	} );

	it( 'should return null for an unknown site', () => {
		const state = {
			siteSettings: {
				items: {},
			},
			sites: {
				items: {
					77203074: {
						options: {
							default_post_format: 'image',
						}
					},
				}
			}
		};
		const output = getSiteDefaultPostFormat( state, siteId );
		expect( output ).to.be.null;
	} );
} );
