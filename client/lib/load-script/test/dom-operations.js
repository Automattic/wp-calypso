/**
 * @format
 * @jest-environment jsdom
*/

/**
 * Internal dependencies
 */
import { createScriptElement } from '../dom-operations';

describe( 'loadScript', () => {
	describe( 'createScriptElement( url )', () => {
		let createElement;
		let script;
		const url = '/some-url-resource';
		const createElementSpy = jest.fn();

		beforeAll( function() {
			createElement = global.window.document.createElement;
			global.window.document.createElement = function( ...args ) {
				createElementSpy( ...args );
				return {};
			};
			script = createScriptElement( url );
		} );

		afterAll( function() {
			global.window.document.createElement = createElement;
		} );

		test( 'should call document.createElement', () => {
			expect( createElementSpy ).toHaveBeenCalledTimes( 1 );
			expect( createElementSpy ).toHaveBeenCalledWith( 'script' );
		} );

		test( 'should have a src matching the url', () => {
			expect( script.src.includes( url ) ).toBeTruthy();
		} );

		test( 'should be marked as a JavaScript script', () => {
			expect( script.type ).toEqual( 'text/javascript' );
		} );

		test( 'should be loaded asynchronously', () => {
			expect( script.async ).toBeTruthy();
		} );

		test( 'should have a defined onload function', () => {
			expect( script.onload ).toBeInstanceOf( Function );
		} );

		test( 'should have a defined onerror function', () => {
			expect( script.onerror ).toBeInstanceOf( Function );
		} );
	} );
} );
