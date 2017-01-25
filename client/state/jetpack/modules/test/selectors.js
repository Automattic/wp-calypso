/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	isFetchingModules,
	getModules,
	getModule
} from '../selectors';

import {
	requests as REQUESTS_FIXTURE,
	moduleData as MODULE_DATA_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isFetchingModules', () => {
		it( 'should return true if the list of modules is being fetched', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isFetchingModules( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the list of modules is currently not being fetched', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 654321;
			const output = isFetchingModules( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that site is not known', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 888888;
			const output = isFetchingModules( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getModules', () => {
		it( 'should return data for all modules for a known site', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							items: {
								123456: MODULE_DATA_FIXTURE
							}
						}
					}
				},
				siteId = 123456;
			const output = getModules( stateIn, siteId );
			expect( output ).to.eql( MODULE_DATA_FIXTURE );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							items: {
								654321: MODULE_DATA_FIXTURE
							}
						}
					}
				},
				siteId = 123456;
			const output = getModules( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getModule', () => {
		it( 'should return data for a specified module for a known site', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							items: {
								123456: MODULE_DATA_FIXTURE
							}
						}
					}
				},
				siteId = 123456;
			const output = getModule( stateIn, siteId, 'module-a' );
			expect( output ).to.eql( MODULE_DATA_FIXTURE[ 'module-a' ] );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							items: {
								654321: MODULE_DATA_FIXTURE
							}
						}
					}
				},
				siteId = 123456;
			const output = getModule( stateIn, siteId, 'module-a' );
			expect( output ).to.be.null;
		} );

		it( 'should return null for an unknown module', () => {
			const stateIn = {
					jetpack: {
						jetpackModules: {
							items: {
								123456: MODULE_DATA_FIXTURE
							}
						}
					}
				},
				siteId = 123456;
			const output = getModule( stateIn, siteId, 'module-z' );
			expect( output ).to.be.null;
		} );
	} );
} );
