import getProductTitle from '../get-product-title';

describe( 'getProductTitle', () => {
	it( 'returns "AI Assistant" if the product name is "Jetpack AI"', () => {
		expect( getProductTitle( 'Jetpack AI' ) ).toBe( 'AI Assistant' );
	} );

	it( 'returns "Stats" if the product name is "Jetpack Stats (Commercial license)"', () => {
		expect( getProductTitle( 'Jetpack Stats (Commercial license)' ) ).toBe( 'Stats' );
	} );

	it.each( [
		[ 'Jetpack Whatchamacallit', 'Whatchamacallit' ],
		[ 'A Jetpack Christmas', 'A Christmas' ],
		[ 'Jetpack\t\tJetpack Jetpack', '\tJetpack' ],
		[ 'Jetpack I declare JETPACK!', 'I declare JETPACK!' ],
		[ 'Jetpack Backup', 'Backup' ],
		[ 'Jetpack Social Advanced', 'Social Advanced' ],
	] )(
		'removes all occurrences of "Jetpack" with a trailing whitespace character from the product name',
		( input, expected ) => {
			expect( getProductTitle( input ) ).toBe( expected );
		}
	);

	it.each( [
		[ 'Thingy (by Automattic)', 'Thingy by Automattic' ],
		[ '(Whatever) This is a test case', 'Whatever This is a test case' ],
		[ 'I (cannot) think (of) anything (creative)', 'I cannot think of anything creative' ],
		[ '(Wow the parentheses are gone)', 'Wow the parentheses are gone' ],
	] )( 'removes all parentheses', ( input, expected ) => {
		expect( getProductTitle( input ) ).toBe( expected );
	} );
} );
