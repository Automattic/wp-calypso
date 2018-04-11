/** @format */

/**
 * Internal dependencies
 */
import Undocumented from '../undocumented';

/**
 * This will let the method apply its logic and return the API call
 * return this.wpcom.req.get(…)
 *
 * We can see hot the params are transformed into an API call.
 */
const undocumented = new Undocumented( {
	req: {
		get( ...args ) {
			return args;
		},
		post( ...args ) {
			return args;
		},
	},
} );
const getSiteConnectInfo = undocumented.getSiteConnectInfo.bind( undocumented );

/**
 * Handy constants
 */
const apiPath = '/connect/site-info';
const expectedParams = {
	filters: undefined,
	apiVersion: '1.1',
};

// Surface regressions
test( 'should return expected output for a variety of inputs', () => {
	[
		'http://example.com',
		'https://example.com',
		'http://www.example.com',
		'http://example.com/',
		'https://example.com/',
		'http://example.com/a/path',
		'http://example.com/a/path?query=args',
		'http://example.com:12345',
		'http://example.com:12345/',
		'http://example.com:12345/a/path?query=args',
		'http://example.com/a%20path?full&of=bad%25chars',
		'http://áèîøüñç.com',
	].forEach( url => expect( getSiteConnectInfo( url ) ).toMatchSnapshot() );
} );

test( 'should correctly handle a simple URL', () => {
	expect( getSiteConnectInfo( 'http://example.com/' )[ 0 ] ).toBe(
		`${ apiPath }/http/example.com`
	);
} );

test( 'should pass filters as a query argument', () => {
	const filters = [ 'a', 'b', 'c' ];
	expect( getSiteConnectInfo( 'http://example.com/', filters ) ).toEqual( [
		`${ apiPath }/http/example.com`,
		{
			...expectedParams,
			filters,
		},
	] );
} );

test( 'should handle internationalized domain names (IDNs)', () => {
	expect( getSiteConnectInfo( 'http://áèîøüñç.com/' )[ 0 ] ).toBe(
		`${ apiPath }/http/xn--1camcyp5b2a.com`
	);
} );

test( 'should handle punyencoded IDNs', () => {
	expect( getSiteConnectInfo( 'http://xn--1caosm8aya.com' )[ 0 ] ).toBe(
		`${ apiPath }/http/xn--1caosm8aya.com`
	);
} );

test( 'should handle escaped characters', () => {
	expect( getSiteConnectInfo( 'http://example.com/a%20path?full&of=bad%25chars' )[ 0 ] ).toBe(
		`${ apiPath }/http/example.com::a%20path?full&of=bad%25chars`
	);
} );

test( 'should translate / in paths to ::', () => {
	expect( getSiteConnectInfo( 'http://example.com/a/multipart/path' )[ 0 ] ).toBe(
		`${ apiPath }/http/example.com::a::multipart::path`
	);
} );
