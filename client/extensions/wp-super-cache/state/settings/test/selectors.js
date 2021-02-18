/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSettings,
	isRestoringSettings,
	isSavingSettings,
	isSettingsSaveSuccessful,
	getSettings,
	getSettingsSaveStatus,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingSettings()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				},
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingSettings( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the settings are not being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							requesting: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if the settings are being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isRestoringSettings()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: undefined,
					},
				},
			};
			const isRestoring = isRestoringSettings( state, primarySiteId );

			expect( isRestoring ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							restoring: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRestoring = isRestoringSettings( state, secondarySiteId );

			expect( isRestoring ).to.be.false;
		} );

		test( 'should return false if the settings are not being restored', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							restoring: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isRestoring = isRestoringSettings( state, primarySiteId );

			expect( isRestoring ).to.be.false;
		} );

		test( 'should return true if the settings are being restored', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							restoring: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRestoring = isRestoringSettings( state, primarySiteId );

			expect( isRestoring ).to.be.true;
		} );
	} );

	describe( 'isSavingSettings()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: true, status: 'pending' },
							},
						},
					},
				},
			};
			const isSaving = isSavingSettings( state, secondarySiteId );

			expect( isSaving ).to.be.false;
		} );

		test( 'should return false if the site settings are not saving', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: false, status: 'success' },
							},
						},
					},
				},
			};
			const isSaving = isSavingSettings( state, primarySiteId );

			expect( isSaving ).to.be.false;
		} );

		test( 'should return true if the site settings are saving', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: true, status: 'pending' },
							},
						},
					},
				},
			};
			const isSaving = isSavingSettings( state, primarySiteId );

			expect( isSaving ).to.be.true;
		} );
	} );

	describe( 'isSettingsSaveSuccessful()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: true, status: 'pending' },
							},
						},
					},
				},
			};
			const isSuccessful = isSettingsSaveSuccessful( state, secondarySiteId );

			expect( isSuccessful ).to.be.false;
		} );

		test( 'should return true if the save request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: false, status: 'success' },
							},
						},
					},
				},
			};
			const isSuccessful = isSettingsSaveSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.true;
		} );

		test( 'should return false if the save request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: false, status: 'error' },
							},
						},
					},
				},
			};
			const isSuccessful = isSettingsSaveSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.false;
		} );
	} );

	describe( 'getSettings()', () => {
		const primarySettings = { is_cache_enabled: true };

		test( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				},
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.be.null;
		} );

		test( 'should return null if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							items: {
								[ primarySiteId ]: primarySettings,
							},
						},
					},
				},
			};
			const settings = getSettings( state, secondarySiteId );

			expect( settings ).to.be.null;
		} );

		test( 'should return the settings for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							items: {
								[ primarySiteId ]: primarySettings,
							},
						},
					},
				},
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.eql( primarySettings );
		} );
	} );

	describe( 'getSettingsSaveStatus()', () => {
		test( 'should return undefined if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: true, status: 'pending' },
							},
						},
					},
				},
			};
			const status = getSettingsSaveStatus( state, secondarySiteId );

			expect( status ).to.be.undefined;
		} );

		test( 'should return success if the save request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: false, status: 'success' },
							},
						},
					},
				},
			};
			const status = getSettingsSaveStatus( state, primarySiteId );

			expect( status ).to.eql( 'success' );
		} );

		test( 'should return error if the save request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: false, status: 'error' },
							},
						},
					},
				},
			};
			const status = getSettingsSaveStatus( state, primarySiteId );

			expect( status ).to.eql( 'error' );
		} );

		test( 'should return pending if the save request status is pending', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						settings: {
							saveStatus: {
								[ primarySiteId ]: { saving: true, status: 'pending' },
							},
						},
					},
				},
			};
			const status = getSettingsSaveStatus( state, primarySiteId );

			expect( status ).to.eql( 'pending' );
		} );
	} );
} );
