/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	isRequestingModuleSettings,
	isUpdatingModuleSettings,
	getModulesSettings,
	getModuleSettings,
} from '../selectors';

import {
	requests as REQUESTS_FIXTURE,
	moduleSettings as MODULE_SETTINGS_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isRequestingModuleSettings', () => {
		it( 'should return true if module settings are currently being requested', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isRequestingModuleSettings( stateIn, siteId, 'module-b' );
			expect( output ).to.be.true;
		} );

		it( 'should return false if module settings are currently not being requested', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isRequestingModuleSettings( stateIn, siteId, 'module-a' );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that module is not known', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isRequestingModuleSettings( stateIn, siteId, 'module-z' );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isUpdatingModuleSettings', () => {
		it( 'should return true if module settings are currently being updated', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isUpdatingModuleSettings( stateIn, siteId, 'module-a' );
			expect( output ).to.be.true;
		} );

		it( 'should return false if module settings are currently not being updated', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isUpdatingModuleSettings( stateIn, siteId, 'module-b' );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that module is not known', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isUpdatingModuleSettings( stateIn, siteId, 'module-z' );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getModulesSettings', () => {
		it( 'should return settings for all modules for a known site', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							items: {
								12345678: MODULE_SETTINGS_FIXTURE
							}
						}
					}
				},
				siteId = 12345678;
			const output = getModulesSettings( stateIn, siteId );
			expect( output ).to.eql( MODULE_SETTINGS_FIXTURE );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							items: {
								654321: MODULE_SETTINGS_FIXTURE
							}
						}
					}
				},
				siteId = 12345678;
			const output = getModulesSettings( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getModuleSettings', () => {
		it( 'should return settings for a specified module for a known site', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							items: {
								12345678: MODULE_SETTINGS_FIXTURE
							}
						}
					}
				},
				siteId = 12345678;
			const output = getModuleSettings( stateIn, siteId, 'module-a' );
			expect( output ).to.eql( MODULE_SETTINGS_FIXTURE[ 'module-a' ] );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							items: {
								654321: MODULE_SETTINGS_FIXTURE
							}
						}
					}
				},
				siteId = 12345678;
			const output = getModuleSettings( stateIn, siteId, 'module-a' );
			expect( output ).to.be.null;
		} );

		it( 'should return null for an unknown module', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModuleSettings: {
							items: {
								12345678: MODULE_SETTINGS_FIXTURE
							}
						}
					}
				},
				siteId = 12345678;
			const output = getModuleSettings( stateIn, siteId, 'module-z' );
			expect( output ).to.be.null;
		} );
	} );
} );
