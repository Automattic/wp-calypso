/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	isRequestingJetpackSettings,
	isUpdatingJetpackSettings,
	getJetpackSettings,
	getJetpackSetting,
} from '../selectors';

import {
	requests as REQUESTS_FIXTURE,
	settings as SETTINGS_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isRequestingJetpackSettings', () => {
		it( 'should return true if settings are currently being requested', () => {
			const stateIn = {
					jetpackSettings: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 87654321;
			const output = isRequestingJetpackSettings( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if settings are currently not being requested', () => {
			const stateIn = {
					jetpackSettings: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isRequestingJetpackSettings( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that site is not known', () => {
			const stateIn = {
					jetpackSettings: {
						settings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isRequestingJetpackSettings( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isUpdatingJetpackSettings', () => {
		it( 'should return true if settings are currently being updated', () => {
			const stateIn = {
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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

	describe( '#getJetpackSettings', () => {
		it( 'should return settings for all modules for a known site', () => {
			const stateIn = {
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
} );
