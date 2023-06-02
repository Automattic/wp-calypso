import { applyTemplate, DIGIT_PLACEHOLDER } from '../phone-number';

describe( 'applyTemplate( number, template, positionTracking )', () => {
	test( 'Basic template is applied', function () {
		const result = applyTemplate(
			'4259999999',
			'(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER )
		);
		const expected = '(425) 999-9999';

		expect( result ).toEqual( expected );
	} );

	test( 'Partial template can be applied', function () {
		const result = applyTemplate( '4259', '...-....'.replace( /\./g, DIGIT_PLACEHOLDER ) );
		const expected = '425-9';

		expect( result ).toEqual( expected );
	} );

	test.each( [
		{ position: 3, expected: 6 },
		{ position: 1, expected: 2 },
		{ position: 4, expected: 7 },
	] )(
		'Cursor position tracking: $position results in $expected',
		function ( { position, expected } ) {
			const positionTracking = { pos: position };
			applyTemplate(
				'4259999999',
				'(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ),
				positionTracking
			);

			expect( positionTracking.pos ).toEqual( expected );
		}
	);
} );
