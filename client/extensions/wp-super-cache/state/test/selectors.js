/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSettings,
	isSavingSettings,
	isSettingsSaveSuccessful,
	getSettings,
	getSettingsSaveStatus,
	getSettingsSaveError,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingSettings()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						requesting: {
							[ primarySiteId ]: true,
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the settings are not being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						requesting: {
							[ primarySiteId ]: false,
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the settings are being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						requesting: {
							[ primarySiteId ]: true,
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isSavingSettings()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const isSaving = isSavingSettings( state, secondarySiteId );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return false if the site settings are not saving', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: false, status: 'success' }
						}
					}
				}
			};
			const isSaving = isSavingSettings( state, primarySiteId );

			expect( isSaving ).to.be.false;
		} );

		it( 'should return true if the site settings are saving', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const isSaving = isSavingSettings( state, primarySiteId );

			expect( isSaving ).to.be.true;
		} );
	} );

	describe( 'isSettingsSaveSuccessful()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const isSuccessful = isSettingsSaveSuccessful( state, secondarySiteId );

			expect( isSuccessful ).to.be.false;
		} );

		it( 'should return true if the save request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: false, status: 'success' }
						}
					}
				}
			};
			const isSuccessful = isSettingsSaveSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.true;
		} );

		it( 'should return false if the save request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: false, status: 'error' }
						}
					}
				}
			};
			const isSuccessful = isSettingsSaveSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.false;
		} );
	} );

	describe( 'getSettings()', () => {
		const primarySettings = { is_cache_enabled: true };

		it( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.be.null;
		} );

		it( 'should return null if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						items: {
							[ primarySiteId ]: primarySettings,
						}
					}
				}
			};
			const settings = getSettings( state, secondarySiteId );

			expect( settings ).to.be.null;
		} );

		it( 'should return the settings for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						items: {
							[ primarySiteId ]: primarySettings,
						}
					}
				}
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.eql( primarySettings );
		} );
	} );

	describe( 'getSettingsSaveStatus()', () => {
		it( 'should return undefined if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const status = getSettingsSaveStatus( state, secondarySiteId );

			expect( status ).to.be.undefined;
		} );

		it( 'should return success if the save request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: false, status: 'success' }
						}
					}
				}
			};
			const status = getSettingsSaveStatus( state, primarySiteId );

			expect( status ).to.eql( 'success' );
		} );

		it( 'should return error if the save request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: false, status: 'error' }
						}
					}
				}
			};
			const status = getSettingsSaveStatus( state, primarySiteId );

			expect( status ).to.eql( 'error' );
		} );

		it( 'should return pending if the save request status is pending', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const status = getSettingsSaveStatus( state, primarySiteId );

			expect( status ).to.eql( 'pending' );
		} );
	} );

	describe( 'getSettingsSaveError()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: true, status: 'pending', error: false }
						}
					}
				}
			};
			const error = getSettingsSaveError( state, secondarySiteId );

			expect( error ).to.be.false;
		} );

		it( 'should return false if the last save request has no error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: false, status: 'success', error: false }
						}
					}
				}
			};
			const error = getSettingsSaveError( state, primarySiteId );

			expect( error ).to.be.false;
		} );

		it( 'should return the error if the save request status has an error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						saveStatus: {
							[ primarySiteId ]: { saving: false, status: 'error', error: 'my error' }
						}
					}
				}
			};
			const error = getSettingsSaveError( state, primarySiteId );

			expect( error ).to.eql( 'my error' );
		} );
	} );
} );
