/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

describe( 'Bundler', () => {
	describe( 'loader', () => {
		jest.mock( 'store', () => {} );
		jest.mock( 'sections-module' );

		const sections = require( './fixtures' ).sections;
		const sectionsModule = {};
		require( 'sections-module' )( require, sectionsModule );

		test( 'getSectionsModule needs to return a module string when code-splitting is enabled', () => {
			const moduleString = require( '../loader-utils' ).getSectionsModule( sections, true );

			expect( moduleString ).to.be.string;
		} );

		test( 'getSectionsModule needs to return a module string when code-splitting is disabled', () => {
			const moduleString = require( '../loader-utils' ).getSectionsModule( sections, false );

			expect( moduleString ).to.be.string;
		} );

		test( 'getSectionsModule needs to return a module string with a get function', () => {
			expect( sectionsModule.exports.get ).to.be.a( 'function' );
		} );

		test( 'getSectionsModule needs to return a module string with a load function', () => {
			expect( sectionsModule.exports.load ).to.be.a( 'function' );
			console.log( sectionsModule.exports.load() );
		} );

		test( 'getSectionsModule needs to return a module string that has correct interface', () => {
			expect( sectionsModule.exports.get() ).to.eql( sections );
		} );
	} );
} );
