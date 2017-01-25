/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	getModules,
	getModule
} from '../selectors';

import { moduleData as MODULE_DATA_FIXTURE } from './fixture';

describe( 'selectors', () => {
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
