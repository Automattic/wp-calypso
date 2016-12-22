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
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveRequestStatus,
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
					saveRequests: {
						2916284: { saving: true, status: 'pending' }
					}
				}
			};
			const isSaving = isSavingSiteSettings( state, 2916285 );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return false if the site settings are not saving', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'success' }
					}
				}
			};
			const isSaving = isSavingSiteSettings( state, 2916284 );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return true if the site settings are saving', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' }
					}
				}
			};
			const isSaving = isSavingSiteSettings( state, 2916284 );

			expect( isSaving ).to.be.true;
		} );
	} );

	describe( 'getSiteSettingsSaveRequestStatus()', () => {
		it( 'should return undefined if the site is not attached', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' }
					}
				}
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916285 );

			expect( status ).to.be.undefined;
		} );

		it( 'should return success if the save request status is success', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'success' }
					}
				}
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916284 );

			expect( status ).to.eql( 'success' );
		} );

		it( 'should return error if the save request status is error', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'error' }
					}
				}
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916284 );

			expect( status ).to.eql( 'error' );
		} );

		it( 'should return pending if the save request status is pending', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' }
					}
				}
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916284 );

			expect( status ).to.eql( 'pending' );
		} );
	} );

	describe( 'isSiteSettingsSaveSuccessful()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' }
					}
				}
			};
			const isSuccessful = isSiteSettingsSaveSuccessful( state, 2916285 );

			expect( isSuccessful ).to.be.false;
		} );

		it( 'should return true if the save request status is success', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'success' }
					}
				}
			};
			const isSuccessful = isSiteSettingsSaveSuccessful( state, 2916284 );

			expect( isSuccessful ).to.be.true;
		} );

		it( 'should return false if the save request status is error', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'error' }
					}
				}
			};
			const isSuccessful = isSiteSettingsSaveSuccessful( state, 2916284 );

			expect( isSuccessful ).to.be.false;
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
