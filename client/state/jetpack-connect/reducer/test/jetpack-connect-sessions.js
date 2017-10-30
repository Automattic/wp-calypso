/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

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
		expect( state ).to.eql( {} );
	} );

	test( 'should add the url slug as a new property when checking a new url', () => {
		const state = jetpackConnectSessions( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com',
		} );

		expect( state )
			.to.have.property( 'example.wordpress.com' )
			.to.be.a( 'object' );
	} );

	test( 'should convert forward slashes to double colon when checking a new url', () => {
		const state = jetpackConnectSessions( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com/example123',
		} );

		expect( state )
			.to.have.property( 'example.wordpress.com::example123' )
			.to.be.a( 'object' );
	} );

	test( 'should store a timestamp when checking a new url', () => {
		const nowTime = Date.now();
		const state = jetpackConnectSessions( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com',
		} );

		expect( state[ 'example.wordpress.com' ] )
			.to.have.property( 'timestamp' )
			.to.be.at.least( nowTime );
	} );

	test( 'should update the timestamp when checking an existent url', () => {
		const nowTime = Date.now();
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp: 1 } },
			{
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state[ 'example.wordpress.com' ] )
			.to.have.property( 'timestamp' )
			.to.be.at.least( nowTime );
	} );

	test( 'should not restore a state with a property without a timestamp', () => {
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': {} },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).to.be.eql( {} );
	} );

	test( 'should not restore a state with a property with a non-integer timestamp', () => {
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp: '1' } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).to.be.eql( {} );
	} );

	test( 'should not restore a state with a property with a stale timestamp', () => {
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp: 1 } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).to.be.eql( {} );
	} );

	test( 'should not restore a state with a session stored with extra properties', () => {
		const timestamp = Date.now();
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp, foo: 'bar' } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).to.be.eql( {} );
	} );

	test( 'should restore a valid state', () => {
		const timestamp = Date.now();
		const state = jetpackConnectSessions(
			{ 'example.wordpress.com': { timestamp } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).to.be.eql( { 'example.wordpress.com': { timestamp } } );
	} );

	test( 'should restore a valid state including dashes, slashes and semicolons', () => {
		const timestamp = Date.now();
		const state = jetpackConnectSessions(
			{ 'https://example.wordpress.com:3000/test-one': { timestamp } },
			{
				type: DESERIALIZE,
			}
		);

		expect( state ).to.be.eql( { 'https://example.wordpress.com:3000/test-one': { timestamp } } );
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

		expect( state ).to.be.eql( { 'automattic.wordpress.com': { timestamp } } );
	} );
} );
