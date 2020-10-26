/**
 * Internal dependencies
 */
import {
	fetchCountriesTransactions,
	updateCountriesTransactions,
	showCountriesTransactionsLoadingError,
} from '../';
import { COUNTRIES_PAYMENTS_UPDATED, NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'me transactions supported-countries', () => {
		describe( '#fetchCountriesTransactions', () => {
			test( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };

				expect( fetchCountriesTransactions( action ) ).toEqual(
					expect.objectContaining(
						http(
							{
								apiVersion: '1.1',
								method: 'GET',
								path: '/me/transactions/supported-countries/',
							},
							action
						)
					)
				);
			} );
		} );

		describe( '#updateCountriesTransactions', () => {
			test( 'should dispatch updated action', () => {
				const action = { type: 'DUMMY' };
				const data = [ 'BG', 'US', 'UK' ];

				expect( updateCountriesTransactions( action, data ) ).toEqual(
					expect.objectContaining( {
						type: COUNTRIES_PAYMENTS_UPDATED,
						countries: data,
					} )
				);
			} );
		} );

		describe( '#showCountriesTransactionsLoadingError', () => {
			test( 'should dispatch error notice', () => {
				expect( showCountriesTransactionsLoadingError() ).toMatchObject( {
					type: NOTICE_CREATE,
					notice: {
						text: "We couldn't load the countries list.",
					},
				} );
			} );
		} );
	} );
} );
