/**
 * Internal dependencies
 */
import { getActiveStyle, replaceActiveStyle } from '../';

describe( 'getActiveStyle', () => {
	it( 'Should return the undefined if no active style', () => {
		const styles = [
			{ name: 'small' },
			{ name: 'big' },
		];
		const className = 'custom-className';

		expect( getActiveStyle( styles, className ) ).toBeUndefined();
	} );

	it( 'Should return the default style if no active style', () => {
		const styles = [
			{ name: 'small' },
			{ name: 'big', isDefault: true },
		];
		const className = 'custom-className';

		expect( getActiveStyle( styles, className ).name ).toBe( 'big' );
	} );

	it( 'Should return the active style', () => {
		const styles = [
			{ name: 'small' },
			{ name: 'big', isDefault: true },
		];
		const className = 'this-is-custom is-style-small';

		expect( getActiveStyle( styles, className ).name ).toBe( 'small' );
	} );

	it( 'Should return the first active style', () => {
		const styles = [
			{ name: 'small' },
			{ name: 'big', isDefault: true },
		];
		const className = 'this-is-custom is-style-small is-style-big';

		expect( getActiveStyle( styles, className ).name ).toBe( 'small' );
	} );
} );

describe( 'replaceActiveStyle', () => {
	it( 'Should add the new style if no active style', () => {
		const activeStyle = undefined;
		const newStyle = { name: 'small' };
		const className = 'custom-class';

		expect( replaceActiveStyle( className, activeStyle, newStyle ) )
			.toBe( 'custom-class is-style-small' );
	} );

	it( 'Should replace the previous active style', () => {
		const activeStyle = { name: 'large' };
		const newStyle = { name: 'small' };
		const className = 'custom-class is-style-large';

		expect( replaceActiveStyle( className, activeStyle, newStyle ) )
			.toBe( 'custom-class is-style-small' );
	} );
} );
