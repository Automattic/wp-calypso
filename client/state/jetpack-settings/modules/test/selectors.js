/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	isActivatingModule,
	isModuleActive
} from '../selectors';

import {
	modules as MODULES_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isActivatingModule', () => {
		it( 'should return state.jetpackSettings.jetpackModules.requests[ siteId ][ module_slug ].activating', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isActivatingModule( stateIn, siteId, 'module-b' );
			expect( output ).to.be.true;
		} );
	} );

	describe( '#isModuleActive', () => {
		it( 'should return state.jetpackSettings.jetpackModules.items[ siteId ][ module_slug ].active', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							items: MODULES_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isModuleActive( stateIn, siteId, 'module-a' );
			expect( output ).to.eql( stateIn.jetpackSettings.jetpackModules.items[ siteId ][ 'module-a' ].active );
		} );
	} );
} );
