/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSectionsModule } from '../loader-utils';

describe( 'Bundler', () => {
	describe( 'loader', () => {
		const sections = [
			{ name: 'sites', paths: [ '/sites' ], module: 'my-sites', group: 'sites', secondary: true },
			{ name: 'test', paths: [ '/test' ], module: 'my-test', group: 'test', secondary: true },
		];

		test( 'getSectionsModule needs to return a module string', () => {
			const moduleString = getSectionsModule( sections );

			expect( moduleString ).to.be.string;
		} );

		test( 'getSectionsModule needs to return a module string that has correct interface', () => {
			jest.mock( 'store', () => {} );
			const moduleString = getSectionsModule( sections );
			const mockCommonJSmodule = 'const module = {}; ';
			const finalModuleString =
				mockCommonJSmodule + moduleString.replace( /import\(/gi, 'fakeImport(' );
			const module = eval( finalModuleString );

			expect( module.get ).to.be.a( 'function' );
			expect( module.load ).to.be.a( 'function' );
			expect( module.get() ).to.eql( sections );
		} );
	} );
} );
