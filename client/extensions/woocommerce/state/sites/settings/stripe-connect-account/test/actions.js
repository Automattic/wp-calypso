/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { deauthorizeAccount, fetchAccountDetails } from '../actions';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchAccountDetails()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v1/connect/stripe/account&_method=get', json: true } )
				.reply( 200, {
					data: {
						success: true,
						account_id: 'acct_14qyt6Alijdnw0EA',
						display_name: 'Foo Bar',
						email: 'foo@bar.com',
						legal_entity: {
							first_name: 'Foo',
							last_name: 'Bar',
						},
						payouts_enabled: true,
						business_logo: 'https://foo.com/bar.png',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchAccountDetails( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with account details when the request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchAccountDetails( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
					siteId,
					connectedUserID: 'acct_14qyt6Alijdnw0EA',
					displayName: 'Foo Bar',
					email: 'foo@bar.com',
					firstName: 'Foo',
					isActivated: true,
					logo: 'https://foo.com/bar.png',
					lastName: 'Bar',
				} );
			} );
		} );
	} );

	describe( 'actions', () => {
		describe( '#deauthorizeAccount()', () => {
			const siteId = '123';

			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
					.query( { path: '/wc/v1/connect/stripe/account/deauthorize&_method=post', json: true } )
					.reply( 200, {
						data: {
							success: true,
							account_id: 'acct_14qyt6Alijdnw0EA',
						},
					} );
			} );

			test( 'should dispatch an action', () => {
				const getState = () => ( {} );
				const dispatch = spy();
				deauthorizeAccount( siteId )( dispatch, getState );
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
					siteId,
				} );
			} );

			test( 'should dispatch a success action when the request completes', () => {
				const getState = () => ( {} );
				const dispatch = spy();
				const response = deauthorizeAccount( siteId )( dispatch, getState );

				return response.then( () => {
					expect( dispatch ).to.have.been.calledWith( {
						type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
						siteId,
					} );
				} );
			} );
		} );
	} );
} );
