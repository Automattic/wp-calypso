import reactNodeToString from '../index';

describe( 'reactNodeToString', function () {
	it( 'should return an empty string if param is null or undefined', function () {
		expect( reactNodeToString() ).toBe( '' );
		expect( reactNodeToString( null ) ).toBe( '' );
	} );

	it( 'should return an empty string if param is an object', function () {
		expect( reactNodeToString( {} ) ).toBe( '' );
	} );

	it( 'should return an empty string if param is a boolean', function () {
		expect( reactNodeToString( true ) ).toBe( '' );
	} );

	it( 'should return a string if param is a number', function () {
		expect( reactNodeToString( 1 ) ).toBe( '1' );
	} );

	it( 'should return param if it is a string', function () {
		expect( reactNodeToString( 'Lorem ipsum' ) ).toBe( 'Lorem ipsum' );
	} );

	it( 'should return a string equivalent if param is a React element', function () {
		const elt = (
			<>
				VaultPress Backup <em>Daily</em> <span>10GB</span>
			</>
		);

		expect( reactNodeToString( elt ) ).toBe( 'VaultPress Backup Daily 10GB' );
	} );
} );
