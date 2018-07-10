/**
 * Internal dependencies
 */
import { elementShouldBeHidden } from '../aria-helper';

describe( 'aria-helper', () => {
	describe( 'elementShouldBeHidden', () => {
		it( 'should return true when a div element without attributes is passed', () => {
			const element = document.createElement( 'div' );

			expect( elementShouldBeHidden( element ) ).toBe( true );
		} );

		it( 'should return false when a script element without attributes is passed', () => {
			const element = document.createElement( 'script' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );

		it( 'should return false when an element has the aria-hidden attribute with value "true"', () => {
			const element = document.createElement( 'div' );
			element.setAttribute( 'aria-hidden', 'true' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );

		it( 'should return false when an element has the aria-hidden attribute with value "false"', () => {
			const element = document.createElement( 'div' );
			element.setAttribute( 'aria-hidden', 'false' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );

		it( 'should return false when an element has the role attribute with value "alert"', () => {
			const element = document.createElement( 'div' );
			element.setAttribute( 'role', 'alert' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );

		it( 'should return false when an element has the role attribute with value "status"', () => {
			const element = document.createElement( 'div' );
			element.setAttribute( 'role', 'status' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );

		it( 'should return false when an element has the role attribute with value "log"', () => {
			const element = document.createElement( 'div' );
			element.setAttribute( 'role', 'log' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );

		it( 'should return false when an element has the role attribute with value "marquee"', () => {
			const element = document.createElement( 'div' );
			element.setAttribute( 'role', 'marquee' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );

		it( 'should return false when an element has the role attribute with value "timer"', () => {
			const element = document.createElement( 'div' );
			element.setAttribute( 'role', 'timer' );

			expect( elementShouldBeHidden( element ) ).toBe( false );
		} );
	} );
} );
