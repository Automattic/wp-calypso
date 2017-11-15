/** @format */
/**
 * Internal dependencies
 */
import jetpackConnectSessions from '../jetpack-connect-sessions';
import { DESERIALIZE, JETPACK_CONNECT_CHECK_URL } from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';

describe( '#jetpackConnectSessions()', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should default to an empty object', () => {
		const state = jetpackConnectSessions( undefined, {} );
		expect( state ).toEqual( {} );
	} );

	test( 'should add the url slug as a new property when checking a new url', () => {
		const state = jetpackConnectSessions( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com',
		} );

		expect( state ).toMatchObject( {
			'example.wordpress.com': expect.any( Object ),
		} );
	} );

	test( 'should convert forward slashes to double colon when checking a new url', () => {
		const state = jetpackConnectSessions( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com/example123',
		} );

		expect( state ).toMatchObject( {
			'example.wordpress.com::example123': expect.any( Object ),
		} );
	} );

	test( 'should store a timestamp when checking a new url', () => {
		const state = jetpackConnectSessions( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com',
		} );

		expect( state[ 'example.wordpress.com' ] ).toMatchObject( { timestamp: expect.any( Number ) } );
	} );

	test( 'should update the timestamp when checking an existent url', () => {
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp: 1 } },
			{
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state[ 'example.wordpress.com' ] ).toMatchObject( { timestamp: expect.any( Number ) } );
	} );

	test( 'should not restore a state with a property without a timestamp', () => {
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': {} },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).toEqual( {} );
	} );

	test( 'should not restore a state with a property with a non-integer timestamp', () => {
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp: '1' } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).toEqual( {} );
	} );

	test( 'should not restore a state with a property with a stale timestamp', () => {
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp: 1 } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).toEqual( {} );
	} );

	test( 'should not restore a state with a session stored with extra properties', () => {
		const timestamp = Date.now();
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp, foo: 'bar' } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).toEqual( {} );
	} );

	test( 'should restore a valid state', () => {
		const timestamp = Date.now();
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).toEqual( { 'example.wordpress.com': { timestamp } } );
	} );

	test( 'should restore a valid state including dashes, slashes and semicolons', () => {
		const timestamp = Date.now();
		const state = jetpackConnectSessions(
			{ 'https://example.wordpress.com:3000/test-one': { timestamp } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).toEqual( { 'https://example.wordpress.com:3000/test-one': { timestamp } } );
	} );

	test( 'should restore only sites with non-stale timestamps', () => {
		const timestamp = Date.now();
		const state = jetpackConnectSessions(
			{
				'example.wordpress.com': { timestamp: 1 },
				'automattic.wordpress.com': { timestamp },
			},
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).toEqual( { 'automattic.wordpress.com': { timestamp } } );
	} );
} );
