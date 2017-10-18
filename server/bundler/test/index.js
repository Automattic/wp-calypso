/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

describe( 'Bundler', () => {
	describe( 'loader', () => {
		const sections = require( './fixtures' ).sections;

		test( 'getSectionsModule needs to return a module string', () => {
			const moduleString = require( '../loader-utils' ).getSectionsModule( sections );

			expect( moduleString ).to.be.string;
		} );

		test( 'getSectionsModule needs to return a module string that has correct interface', () => {
			jest.mock( 'store', () => {} );
			jest.mock(
				'sections-module',
				() => {
					const getSectionsModule = require( '../loader-utils' ).getSectionsModule;
					const moduleStringWithoutImports = getSectionsModule(
						require( './fixtures' ).sections
					).replace( /import\(/gi, 'fakeImport(' );

					return new Function( 'require', 'module', moduleStringWithoutImports );
				},
				{ virtual: true }
			);

			const sectionsModule = {};
			require( 'sections-module' )( require, sectionsModule );

			expect( sectionsModule.exports.get ).to.be.a( 'function' );
			expect( sectionsModule.exports.load ).to.be.a( 'function' );
			expect( sectionsModule.exports.get() ).to.eql( sections );
		} );
	} );
} );
