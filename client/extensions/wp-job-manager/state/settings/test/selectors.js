/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSettings,
	getSettingsState,
	isFetchingSettings,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;
	const primarySettings = { job_manager_hide_expired: true };

	describe( 'getSettingsState()', () => {
		it( 'should return an empty object if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: undefined,
					}
				}
			};
			const settingsState = getSettingsState( state );

			expect( settingsState ).to.deep.equal( {} );
		} );

		it( 'should return the settings state', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							[ primarySiteId ]: {
								items: primarySettings,
							}
						}
					}
				}
			};
			const settings = getSettingsState( state );

			expect( settings ).to.deep.equal( { [ primarySiteId ]: { items: primarySettings } } );
		} );
	} );

	describe( 'isFetchingSettings()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							[ primarySiteId ]: {
								fetching: true,
							}
						}
					}
				}
			};
			const isFetching = isFetchingSettings( state, secondarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return false if the settings are not being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							[ primarySiteId ]: {
								fetching: false,
							}
						}
					}
				}
			};
			const isFetching = isFetchingSettings( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return true if the settings are being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							[ primarySiteId ]: {
								fetching: true,
							}
						}
					}
				}
			};
			const isFetching = isFetchingSettings( state, primarySiteId );

			expect( isFetching ).to.be.true;
		} );
	} );

	describe( 'getSettings()', () => {
		it( 'should return an empty object if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							[ primarySiteId ]: {
								items: primarySettings,
							}
						}
					}
				}
			};
			const settings = getSettings( state, secondarySiteId );

			expect( settings ).to.deep.equal( {} );
		} );

		it( 'should return the settings for a siteId', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							[ primarySiteId ]: {
								items: primarySettings,
							}
						}
					}
				}
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.deep.equal( primarySettings );
		} );
	} );
} );
