import { hasScrolledToEnd } from '../use-has-scrolled-to-end';

describe( 'useHasScrolledToEnd#hasScrolledToEnd', () => {
	it( 'returns false when element is not scrolled to the end', () => {
		expect( hasScrolledToEnd( { scrollHeight: 500, scrollTop: 0, clientHeight: 100 } ) ).toBe(
			false
		);
	} );

	it( 'returns true when element is scrolled to the end', () => {
		expect( hasScrolledToEnd( { scrollHeight: 500, scrollTop: 400, clientHeight: 100 } ) ).toBe(
			true
		);
	} );

	it( 'returns true when element is scrolled to the end with fractional scrollTop', () => {
		expect( hasScrolledToEnd( { scrollHeight: 500, scrollTop: 399.5, clientHeight: 100 } ) ).toBe(
			true
		);
	} );
} );
