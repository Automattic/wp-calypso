/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	isActivatingModule,
	isModuleActivated
} from '../selectors';

import {
	modules as MODULES_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'requests selectors', () => {
	describe( '#isActivatingModule', () => {
		it( 'should return state.jetpackSettings.jetpackModules.requests.activating[ siteId ][ module_slug ]', () => {
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
} );

describe( 'items selectors', () => {
	describe( '#isModuleActivated', () => {
		it( 'should return state.jetpackSettings.jetpackModules.items[ siteId ][ module_slug ].active', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							items: MODULES_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isModuleActivated( stateIn, siteId, 'module-a' );
			expect( output ).to.eql( stateIn.jetpackSettings.jetpackModules.items[ siteId ][ 'module-a' ].active );
		} );
	} );
} );
