/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchSetupChoices } from '../actions';
import { LOADING } from 'woocommerce/state/constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchSetupChoices()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/123/calypso-preferences/woocommerce' )
				.reply( 200, {
					finished_initial_setup: true,
					opted_out_of_shipping_setup: true,
					opted_out_of_taxes_setup: true,
					tried_customizer_during_initial_setup: true,
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchSetupChoices( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_SETUP_CHOICES_REQUEST, siteId } );
		} );

		it( 'should dispatch a success action with setup choices when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchSetupChoices( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
					siteId,
					data: {
						finished_initial_setup: true,
						opted_out_of_shipping_setup: true,
						opted_out_of_taxes_setup: true,
						tried_customizer_during_initial_setup: true,
					}
				} );
			} );
		} );

		it( 'should not dispatch if setup choices are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								setupChoices: LOADING
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchSetupChoices( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
