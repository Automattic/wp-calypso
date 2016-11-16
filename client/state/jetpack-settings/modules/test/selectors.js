/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	isActivatingModule,
	isDeactivatingModule,
	isModuleActive,
	isFetchingModules
} from '../selectors';

import {
	modules as MODULES_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isActivatingModule', () => {
		it( 'should return true if module is currently being activated', () => {
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

		it( 'should return false if module is currently not being activated', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isActivatingModule( stateIn, siteId, 'module-a' );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that module is not known', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isActivatingModule( stateIn, siteId, 'module-z' );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isDeactivatingModule', () => {
		it( 'should return true if module is currently being deactivated', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isDeactivatingModule( stateIn, siteId, 'module-a' );
			expect( output ).to.be.true;
		} );

		it( 'should return false if module is currently not being deactivated', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isDeactivatingModule( stateIn, siteId, 'module-b' );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that module is not known', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isDeactivatingModule( stateIn, siteId, 'module-z' );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isModuleActive', () => {
		it( 'should return true if the module is currently active', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							items: MODULES_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isModuleActive( stateIn, siteId, 'module-b' );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the module is currently not active', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							items: MODULES_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isModuleActive( stateIn, siteId, 'module-a' );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that module is not known', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							items: MODULES_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isModuleActive( stateIn, siteId, 'module-z' );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isFetchingModules', () => {
		it( 'should return true if the list of modules is being fetched', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackModules: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 123456;
			const output = isFetchingModules( stateIn, siteId );
			expect( output ).to.be.true;
		} );
	} );
} );
