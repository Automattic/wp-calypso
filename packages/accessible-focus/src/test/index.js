/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { detectKeyboardNavigation } from '..';

describe( 'detectKeyboardNavigation', () => {
	describe( 'keyCode', () => {
		it.each( [ 9, 32, 37, 38, 39, 40 ] )(
			'should return true when the keyCode is %s',
			( keyCode ) => {
				const event = {
					keyCode,
				};

				expect( detectKeyboardNavigation( event ) ).toBeTruthy();
			}
		);

		it( 'should be false when keyCode does not indicate keyboard navigation', () => {
			const event = {
				keyCode: 46, // delete
			};

			expect( detectKeyboardNavigation( event ) ).toBeFalsy();
		} );
	} );

	describe( 'keyIdentifier', () => {
		it.each( [ 'Tab', ' ', 'Spacebar', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight' ] )(
			'should return true when keyIdenitifer is "%s"',
			( keyIdentifier ) => {
				const event = {
					keyIdentifier,
				};

				expect( detectKeyboardNavigation( event ) ).toBeTruthy();
			}
		);

		it( 'should be false when keyIdentifier does not indicate keyboard navigation', () => {
			const event = {
				keyIdenitifer: 'Delete',
			};

			expect( detectKeyboardNavigation( event ) ).toBeFalsy();
		} );
	} );

	describe( 'key', () => {
		it.each( [ 'Tab', ' ', 'Spacebar', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight' ] )(
			'should return true when key is "%s"',
			( key ) => {
				const event = { key };

				expect( detectKeyboardNavigation( event ) ).toBeTruthy();
			}
		);

		it( 'should be false when key does not indicate keyboard navigation', () => {
			const event = { key: 'Delete' };

			expect( detectKeyboardNavigation( event ) ).toBeFalsy();
		} );
	} );
} );
