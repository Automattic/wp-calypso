import toFinite from '../to-finite';

describe( 'toFinite', () => {
	// Expected values verified against lodash `toFinite`.
	it.each( [
		[ 'integer', 5, 5 ],
		[ 'negative', -5, -5 ],
		[ 'float', 3.14, 3.14 ],
		[ 'zero', 0, 0 ],
		[ 'NaN', NaN, 0 ],
		[ 'Infinity', Infinity, 1.7976931348623157e308 ],
		[ '-Infinity', -Infinity, -1.7976931348623157e308 ],
		[ 'numeric string', '10', 10 ],
		[ 'padded numeric string', '  10  ', 10 ],
		[ 'exponential string', '1e3', 1000 ],
		[ 'binary string', '0b101', 5 ],
		[ 'octal string', '0o17', 15 ],
		[ 'hex string', '0x1f', 31 ],
		[ 'signed hex string', '-0x1f', 0 ],
		[ 'bad hex string', '0xzz', 0 ],
		[ 'non-numeric string', 'abc', 0 ],
		[ 'empty string', '', 0 ],
		[ 'null', null, 0 ],
		[ 'undefined', undefined, 0 ],
		[ 'true', true, 1 ],
		[ 'false', false, 0 ],
		[ 'empty array', [], 0 ],
		[ 'single-element array', [ 5 ], 5 ],
		[ 'multi-element array', [ 5, 6 ], 0 ],
		[ 'plain object', {}, 0 ],
	] )( 'coerces %s to %p like lodash', ( _label, input, expected ) => {
		expect( toFinite( input ) ).toBe( expected );
	} );

	it( 'returns 0 for a symbol instead of throwing', () => {
		expect( toFinite( Symbol( 'x' ) ) ).toBe( 0 );
	} );

	it( 'returns 0 for a boxed symbol, like lodash', () => {
		expect( toFinite( Object( Symbol( 'x' ) ) ) ).toBe( 0 );
	} );

	it( 'derives object values from valueOf only, like lodash', () => {
		// `valueOf` returning a primitive is used directly.
		expect( toFinite( { valueOf: () => 8 } ) ).toBe( 8 );
		expect( toFinite( { valueOf: () => '8' } ) ).toBe( 8 );
		// `valueOf` returning an object is stringified — lodash does NOT fall back
		// to the original object's `toString`, so this is 0 (not 8) like lodash.
		expect( toFinite( { valueOf: () => ( {} ), toString: () => '8' } ) ).toBe( 0 );
		// With no custom `valueOf`, the default returns the object, so `toString`
		// is consulted via stringification.
		expect( toFinite( { toString: () => '8' } ) ).toBe( 8 );
		expect( toFinite( new Date( 1000 ) ) ).toBe( 1000 );
	} );
} );
