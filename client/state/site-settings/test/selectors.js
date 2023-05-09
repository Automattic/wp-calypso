import {
	isRequestingSiteSettings,
	isSavingSiteSettings,
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveRequestStatus,
	getSiteSettings,
	getSiteSettingsSaveError,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingSiteSettings()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				siteSettings: {
					requesting: {
						2916284: true,
					},
				},
			};
			const isRequesting = isRequestingSiteSettings( state, 2916285 );

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return false if the site settings are not fetching', () => {
			const state = {
				siteSettings: {
					requesting: {
						2916284: false,
					},
				},
			};
			const isRequesting = isRequestingSiteSettings( state, 2916284 );

			expect( isRequesting ).toBe( false );
		} );

		test( 'should return true if the site settings are fetching', () => {
			const state = {
				siteSettings: {
					requesting: {
						2916284: true,
					},
				},
			};
			const isRequesting = isRequestingSiteSettings( state, 2916284 );

			expect( isRequesting ).toBe( true );
		} );
	} );

	describe( 'isSavingSiteSettings()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' },
					},
				},
			};
			const isSaving = isSavingSiteSettings( state, 2916285 );

			expect( isSaving ).toBe( false );
		} );

		test( 'should return false if the site settings are not saving', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'success' },
					},
				},
			};
			const isSaving = isSavingSiteSettings( state, 2916284 );

			expect( isSaving ).toBe( false );
		} );

		test( 'should return true if the site settings are saving', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' },
					},
				},
			};
			const isSaving = isSavingSiteSettings( state, 2916284 );

			expect( isSaving ).toBe( true );
		} );
	} );

	describe( 'getSiteSettingsSaveRequestStatus()', () => {
		test( 'should return undefined if the site is not attached', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' },
					},
				},
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916285 );

			expect( status ).toBeUndefined();
		} );

		test( 'should return success if the save request status is success', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'success' },
					},
				},
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916284 );

			expect( status ).toEqual( 'success' );
		} );

		test( 'should return error if the save request status is error', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'error' },
					},
				},
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916284 );

			expect( status ).toEqual( 'error' );
		} );

		test( 'should return pending if the save request status is pending', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' },
					},
				},
			};
			const status = getSiteSettingsSaveRequestStatus( state, 2916284 );

			expect( status ).toEqual( 'pending' );
		} );
	} );

	describe( 'isSiteSettingsSaveSuccessful()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' },
					},
				},
			};
			const isSuccessful = isSiteSettingsSaveSuccessful( state, 2916285 );

			expect( isSuccessful ).toBe( false );
		} );

		test( 'should return true if the save request status is success', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'success' },
					},
				},
			};
			const isSuccessful = isSiteSettingsSaveSuccessful( state, 2916284 );

			expect( isSuccessful ).toBe( true );
		} );

		test( 'should return false if the save request status is error', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'error' },
					},
				},
			};
			const isSuccessful = isSiteSettingsSaveSuccessful( state, 2916284 );

			expect( isSuccessful ).toBe( false );
		} );
	} );

	describe( 'getSiteSettingsSaveError()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: true, status: 'pending', error: false },
					},
				},
			};
			const error = getSiteSettingsSaveError( state, 2916285 );

			expect( error ).toBe( false );
		} );

		test( 'should return false if the save the last request has no error', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'success', error: false },
					},
				},
			};
			const error = getSiteSettingsSaveError( state, 2916284 );

			expect( error ).toBe( false );
		} );

		test( 'should return the error if the save request status has an error', () => {
			const state = {
				siteSettings: {
					saveRequests: {
						2916284: { saving: false, status: 'error', error: 'my Error' },
					},
				},
			};
			const error = getSiteSettingsSaveError( state, 2916284 );

			expect( error ).toEqual( 'my Error' );
		} );
	} );

	describe( 'getSiteSettings()', () => {
		test( 'should return null if the site is not tracked', () => {
			const state = {
				siteSettings: {
					items: {
						2916284: { default_category: 'chicken' },
					},
				},
			};
			const settings = getSiteSettings( state, 2916285 );

			expect( settings ).toBeNull();
		} );

		test( 'should return the settings for a siteId', () => {
			const state = {
				siteSettings: {
					items: {
						2916284: { default_category: 'chicken' },
					},
				},
			};
			const settings = getSiteSettings( state, 2916284 );

			expect( settings ).toEqual( { default_category: 'chicken' } );
		} );
	} );
} );
