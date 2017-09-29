/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { COUNTRIES_PAYMENTS_UPDATED, NOTICE_CREATE } from 'state/action-types';
import {
	fetchCountriesTransactions,
	updateCountriesTransactions,
	showCountriesTransactionsLoadingError,
} from '../';

describe( 'wpcom-api', () => {
	describe( 'me transactions supported-countries', () => {
		describe( '#fetchCountriesTransactions', () => {
			it( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();

				fetchCountriesTransactions( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/me/transactions/supported-countries/',
						},
						action
					)
				);
			} );
		} );

		describe( '#updateCountriesTransactions', () => {
			it( 'should dispatch updated action', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const data = [ 'BG', 'US', 'UK' ];

				updateCountriesTransactions( { dispatch }, action, data );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: COUNTRIES_PAYMENTS_UPDATED,
					countries: data,
				} );
			} );
		} );

		describe( '#showCountriesTransactionsLoadingError', () => {
			it( 'should dispatch error notice', () => {
				const dispatch = spy();

				showCountriesTransactionsLoadingError( { dispatch } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: "We couldn't load the countries list.",
					},
				} );
			} );
		} );
	} );
} );
