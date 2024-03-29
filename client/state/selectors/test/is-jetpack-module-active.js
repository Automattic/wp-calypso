import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { modules as MODULES_FIXTURE } from './fixtures/jetpack-modules';

describe( 'isJetpackModuleActive()', () => {
	test( 'should return true if the module is currently active', () => {
		const stateIn = {
			jetpack: {
				modules: {
					items: MODULES_FIXTURE,
				},
			},
		};
		const siteId = 123456;
		const output = isJetpackModuleActive( stateIn, siteId, 'module-b' );
		expect( output ).toBe( true );
	} );

	test( 'should return false if the module is currently not active', () => {
		const stateIn = {
			jetpack: {
				modules: {
					items: MODULES_FIXTURE,
				},
			},
		};
		const siteId = 123456;
		const output = isJetpackModuleActive( stateIn, siteId, 'module-a' );
		expect( output ).toBe( false );
	} );

	test( 'should return null if that module is not known', () => {
		const stateIn = {
			jetpack: {
				modules: {
					items: MODULES_FIXTURE,
				},
			},
		};
		const siteId = 123456;
		const output = isJetpackModuleActive( stateIn, siteId, 'module-z' );
		expect( output ).toBeNull();
	} );
} );
