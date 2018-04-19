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
		'http://example.com?query=args',
		'http://example.com:12345',
		'http://example.com:12345/',
		'http://example.com:12345/#fragment',
		'http://example.com:12345/a/path?query=args',
		'http://example.com:12345?query=args',
		'http://example.com/this-is-a-tricky-path-%2F%3F%26%3D%3A',
		'http://áèîøüñç.com',
	].forEach( url => expect( getSiteConnectInfo( url ) ).toMatchSnapshot() );
} );

test( 'should correctly handle a simple URL', () => {
	expect( getSiteConnectInfo( 'http://example.com/' )[ 1 ] ).toEqual( {
		url: 'http://example.com/',
	} );

	expect( getSiteConnectInfo( 'https://example.com/' )[ 1 ] ).toEqual( {
		url: 'https://example.com/',
	} );
} );

test( 'should reject with no protocol', async () => {
	await expect( getSiteConnectInfo( '//example.com' ) ).rejects.toMatchSnapshot();
} );

test( 'should handle internationalized domain names (IDNs)', () => {
	expect( getSiteConnectInfo( 'http://áèîøüñç.com/' )[ 1 ] ).toEqual( {
		url: 'http://xn--1camcyp5b2a.com/',
	} );
} );

test( 'should handle punyencoded IDNs', () => {
	expect( getSiteConnectInfo( 'http://xn--1caosm8aya.com' )[ 1 ] ).toEqual( {
		url: 'http://xn--1caosm8aya.com/',
	} );
} );

test( 'should discard a query', () => {
	expect( getSiteConnectInfo( 'http://example.com/?a=query' )[ 1 ] ).toEqual( {
		url: 'http://example.com/',
	} );
} );

test( 'should discard a fragment', () => {
	expect( getSiteConnectInfo( 'http://example.com/#fragment' )[ 1 ] ).toEqual( {
		url: 'http://example.com/',
	} );
} );
