/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	isUpdatingJetpackSettings,
	isRegeneratingPostByEmail,
	getJetpackSettings,
	getJetpackSetting,
	getJetpackSettingsSaveRequestStatus,
	isJetpackSettingsSaveSuccessful,
	getJetpackSettingsSaveError,
} from '../selectors';

import {
	requests as REQUESTS_FIXTURE,
	settings as SETTINGS_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isUpdatingJetpackSettings', () => {
		it( 'should return true if settings are currently being updated', () => {
			const stateIn = {
					jetpack: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isUpdatingJetpackSettings( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if settings are currently not being updated', () => {
			const stateIn = {
					jetpack: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 87654321;
			const output = isUpdatingJetpackSettings( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that site is not known', () => {
			const stateIn = {
					jetpack: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isUpdatingJetpackSettings( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isRegeneratingPostByEmail', () => {
		it( 'should return true if post by email is currently being regenerated', () => {
			const stateIn = {
					jetpack: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isRegeneratingPostByEmail( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if post by email is currently not being regenerated', () => {
			const stateIn = {
					jetpack: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 87654321;
			const output = isRegeneratingPostByEmail( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that site is not known', () => {
			const stateIn = {
					jetpack: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isRegeneratingPostByEmail( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getJetpackSettings', () => {
		it( 'should return settings for all modules for a known site', () => {
			const stateIn = {
					jetpack: {
						settings: {
							items: SETTINGS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = getJetpackSettings( stateIn, siteId );
			expect( output ).to.eql( SETTINGS_FIXTURE[ siteId ] );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpack: {
						settings: {
							items: {
								654321: SETTINGS_FIXTURE
							}
						}
					}
				},
				siteId = 12345678;
			const output = getJetpackSettings( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getJetpackSetting', () => {
		it( 'should return a certain setting for a known site', () => {
			const stateIn = {
					jetpack: {
						settings: {
							items: SETTINGS_FIXTURE
						}
					}
				},
				siteId = 12345678,
				setting = 'setting_1';
			const output = getJetpackSetting( stateIn, siteId, setting );
			expect( output ).to.eql( SETTINGS_FIXTURE[ siteId ][ setting ] );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpack: {
						settings: {
							items: {
								654321: SETTINGS_FIXTURE[ 12345678 ]
							}
						}
					}
				},
				siteId = 12345678,
				setting = 'setting_1';
			const output = getJetpackSetting( stateIn, siteId, setting );
			expect( output ).to.be.null;
		} );

		it( 'should return null for an unknown setting', () => {
			const stateIn = {
					jetpack: {
						settings: {
							items: {
								654321: SETTINGS_FIXTURE[ 12345678 ]
							}
						}
					}
				},
				siteId = 12345678,
				setting = 'unexisting_setting';
			const output = getJetpackSetting( stateIn, siteId, setting );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getJetpackSettingsSaveRequestStatus()', () => {
		it( 'should return undefined if the site is not attached', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const status = getJetpackSettingsSaveRequestStatus( state, 87654321 );

			expect( status ).to.be.undefined;
		} );

		it( 'should return success if the save request status is success', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: false, status: 'success' }
						}
					}
				}
			};
			const status = getJetpackSettingsSaveRequestStatus( state, 12345678 );

			expect( status ).to.eql( 'success' );
		} );

		it( 'should return error if the save request status is error', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: false, status: 'error' }
						}
					}
				}
			};
			const status = getJetpackSettingsSaveRequestStatus( state, 12345678 );

			expect( status ).to.eql( 'error' );
		} );

		it( 'should return pending if the save request status is pending', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const status = getJetpackSettingsSaveRequestStatus( state, 12345678 );

			expect( status ).to.eql( 'pending' );
		} );
	} );

	describe( 'isJetpackSettingsSaveSuccessful()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: true, status: 'pending' }
						}
					}
				}
			};
			const isSuccessful = isJetpackSettingsSaveSuccessful( state, 87654321 );

			expect( isSuccessful ).to.be.false;
		} );

		it( 'should return true if the save request status is success', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: false, status: 'success' }
						}
					}
				}
			};
			const isSuccessful = isJetpackSettingsSaveSuccessful( state, 12345678 );

			expect( isSuccessful ).to.be.true;
		} );

		it( 'should return false if the save request status is error', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: false, status: 'error' }
						}
					}
				}
			};
			const isSuccessful = isJetpackSettingsSaveSuccessful( state, 12345678 );

			expect( isSuccessful ).to.be.false;
		} );
	} );

	describe( 'getJetpackSettingsSaveError()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: true, status: 'pending', error: false }
						}
					}
				}
			};
			const error = getJetpackSettingsSaveError( state, 87654321 );

			expect( error ).to.be.false;
		} );

		it( 'should return false if the save the last request has no error', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: false, status: 'success', error: false }
						}
					}
				}
			};
			const error = getJetpackSettingsSaveError( state, 12345678 );

			expect( error ).to.be.false;
		} );

		it( 'should return the error if the save request status has an error', () => {
			const state = {
				jetpack: {
					settings: {
						saveRequests: {
							12345678: { saving: false, status: 'error', error: 'my Error' }
						}
					}
				}
			};
			const error = getJetpackSettingsSaveError( state, 12345678 );

			expect( error ).to.eql( 'my Error' );
		} );
	} );
} );
