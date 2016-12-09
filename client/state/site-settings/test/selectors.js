/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSiteSettings,
	isSavingSiteSettings,
	getSiteSettings
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingSiteSettings()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				siteSettings: {
					requesting: {
						2916284: true
					}
				}
			};
			const isRequesting = isRequestingSiteSettings( state, 2916285 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site settings are not fetching', () => {
			const state = {
				siteSettings: {
					requesting: {
						2916284: false
					}
				}
			};
			const isRequesting = isRequestingSiteSettings( state, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site settings are fetching', () => {
			const state = {
				siteSettings: {
					requesting: {
						2916284: true
					}
				}
			};
			const isRequesting = isRequestingSiteSettings( state, 2916284 );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isSavingSiteSettings()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				siteSettings: {
					saving: {
						2916284: true
					}
				}
			};
			const isSaving = isSavingSiteSettings( state, 2916285 );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return false if the site settings are not saving', () => {
			const state = {
				siteSettings: {
					saving: {
						2916284: false
					}
				}
			};
			const isSaving = isSavingSiteSettings( state, 2916284 );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return true if the site settings are saving', () => {
			const state = {
				siteSettings: {
					saving: {
						2916284: true
					}
				}
			};
			const isSaving = isSavingSiteSettings( state, 2916284 );

			expect( isSaving ).to.be.true;
		} );
	} );

	describe( 'getSiteSettings()', () => {
		it( 'should return null if the site is not tracked', () => {
			const state = {
				siteSettings: {
					items: {
						2916284: { default_category: 'chicken' }
					}
				}
			};
			const settings = getSiteSettings( state, 2916285 );

			expect( settings ).to.be.null;
		} );

		it( 'should return the settings for a siteId', () => {
			const state = {
				siteSettings: {
					items: {
						2916284: { default_category: 'chicken' }
					}
				}
			};
			const settings = getSiteSettings( state, 2916284 );

			expect( settings ).to.eql( { default_category: 'chicken' } );
		} );
	} );
} );
