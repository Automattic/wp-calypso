import safeProtocolUrl from '../';

describe( 'index', () => {
	test( 'should ignore a relative url', () => {
		expect( safeProtocolUrl( '/foo' ) ).toEqual( '/foo' );
	} );

	test( 'should return null for empty url', () => {
		const returnUndefined = function () {
			return;
		};

		expect( safeProtocolUrl( null ) ).toBeNull();
		expect( safeProtocolUrl( returnUndefined() ) ).toBeNull();
		expect( safeProtocolUrl( '' ) ).toBeNull();
	} );

	test( 'should not change url if http protocol', () => {
		expect( safeProtocolUrl( 'http://foo.com' ) ).toEqual( 'http://foo.com' );
		expect( safeProtocolUrl( 'http://foo.com?query=string#id' ) ).toEqual(
			'http://foo.com?query=string#id'
		);
	} );

	test( 'should not change url https protocol', () => {
		expect( safeProtocolUrl( 'https://foo.com' ) ).toEqual( 'https://foo.com' );
		expect( safeProtocolUrl( 'http://foo.com?query=string#id' ) ).toEqual(
			'http://foo.com?query=string#id'
		);
	} );

	test( 'should not strip query args', () => {
		expect( safeProtocolUrl( 'https://foo.com?query=string' ) ).toEqual(
			'https://foo.com?query=string'
		);
		expect( safeProtocolUrl( 'https://foo.com?query=string&again=2' ) ).toEqual(
			'https://foo.com?query=string&again=2'
		);
	} );

	test( 'should not strip query hash', () => {
		expect( safeProtocolUrl( 'https://foo.com#id' ) ).toEqual( 'https://foo.com#id' );
		expect( safeProtocolUrl( 'https://foo.com?query=string#id' ) ).toEqual(
			'https://foo.com?query=string#id'
		);
	} );

	test( 'should make url with javascript protocol safe', () => {
		expect( safeProtocolUrl( 'javascript:function()' ) ).toEqual( 'http:' ); // eslint-disable-line no-script-url
	} );
} );
