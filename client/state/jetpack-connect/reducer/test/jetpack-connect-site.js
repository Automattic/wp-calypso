/**
 * Internal dependencies
 */
import jetpackConnectSite from '../jetpack-connect-site';
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
} from 'calypso/state/jetpack-connect/action-types';

describe( '#jetpackConnectSite()', () => {
	test( 'should default to an empty object', () => {
		const state = jetpackConnectSite( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	test( 'should add the url and mark it as currently fetching', () => {
		const state = jetpackConnectSite( undefined, {
			type: JETPACK_CONNECT_CHECK_URL,
			url: 'https://example.wordpress.com',
		} );

		expect( state ).toMatchObject( {
			url: 'https://example.wordpress.com',
			isFetching: true,
			isFetched: false,
			isDismissed: false,
			installConfirmedByUser: null,
			data: {},
		} );
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

		expect( state ).toMatchObject( {
			isFetching: false,
			isFetched: true,
			data: data,
		} );
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

		expect( state ).toEqual( { url: 'https://automattic.com' } );
		expect( state ).not.toHaveProperty( 'isFetched' );
	} );

	test( 'should mark the url as dismissed if it is the current one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://example.wordpress.com' },
			{
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state ).toMatchObject( {
			installConfirmedByUser: null,
			isDismissed: true,
		} );
	} );

	test( 'should not mark the url as dismissed if it is not the current one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://automattic.com' },
			{
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://example.wordpress.com',
			}
		);

		expect( state ).toEqual( { url: 'https://automattic.com' } );
	} );

	test( 'should set the jetpack confirmed status to the new one', () => {
		const state = jetpackConnectSite(
			{ url: 'https://example.wordpress.com' },
			{
				type: JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
				status: true,
			}
		);

		expect( state ).toMatchObject( { installConfirmedByUser: true } );
	} );
} );
