/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import jetpackConnectSite from '../jetpack-connect-site';
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_REDIRECT,
} from 'state/action-types';

describe( '#jetpackConnectSite()', () => {
	test( 'should default to an empty object', () => {
		const state = jetpackConnectSite( undefined, {} );

		expect( state ).to.eql( {} );
	} );

	test( 'should add the url and mark it as currently fetching', () => {
		const state = jetpackConnectSite( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com',
		} );

		expect( state )
			.to.have.property( 'url' )
			.to.eql( 'https://example.wordpress.com' );
		expect( state ).to.have.property( 'isFetching' ).to.be.true;
		expect( state ).to.have.property( 'isFetched' ).to.be.false;
		expect( state ).to.have.property( 'isDismissed' ).to.be.false;
		expect( state ).to.have.property( 'installConfirmedByUser' ).to.be.null;
		expect( state )
			.to.have.property( 'data' )
			.to.eql( {} );
	} );

	test( 'should mark the url as fetched if it is the current one', () => {
		const data = {
			exists: true,
			isWordPress: true,
			hasJetpack: true,
			isJetpackActive: true,
			isWordPressDotCom: false,
		};
		const state = jetpackConnectSite(
			{ url: 'https://example.wordpress.com' },
			{
				type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
				url: 'https://example.wordpress.com',
				data: data,
			}
		);

		expect( state ).to.have.property( 'isFetching' ).to.be.false;
		expect( state ).to.have.property( 'isFetched' ).to.be.true;
		expect( state )
			.to.have.property( 'data' )
			.to.eql( data );
	} );

	test( 'should not mark the url as fetched if it is not the current one', () => {
		const data = {
			exists: true,
			isWordPress: true,
			hasJetpack: true,
			isJetpackActive: true,
			isWordPressDotCom: false,
		};
		const state = jetpackConnectSite(
			{ url: 'https://automattic.com' },
			{
				type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
				url: 'https://example.wordpress.com',
				data: data,
			}
		);

		expect( state ).to.eql( { url: 'https://automattic.com' } );
		expect( state ).to.not.have.property( 'isFetched' );
	} );

	test( 'should mark the url as dismissed if it is the current one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://example.wordpress.com' },
			{
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state ).to.have.property( 'installConfirmedByUser' ).to.be.null;
		expect( state ).to.have.property( 'isDismissed' ).to.be.true;
	} );

	test( 'should not mark the url as dismissed if it is not the current one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://automattic.com' },
			{
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state ).to.eql( { url: 'https://automattic.com' } );
	} );

	test( 'should schedule a redirect to the url if it is the current one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://example.wordpress.com' },
			{
				type: JETPACK_CONNECT_REDIRECT,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state ).to.have.property( 'isRedirecting' ).to.be.true;
	} );

	test( 'should not schedule a redirect to the url if it is not the current one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://automattic.com' },
			{
				type: JETPACK_CONNECT_REDIRECT,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state ).to.eql( { url: 'https://automattic.com' } );
	} );

	test( 'should set the jetpack confirmed status to the new one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://example.wordpress.com' },
			{
				type: JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
				status: true,
			}
		);

		expect( state ).to.have.property( 'installConfirmedByUser' ).to.be.true;
	} );
} );
