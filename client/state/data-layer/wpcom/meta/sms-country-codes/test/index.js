/**
 * Internal dependencies
 */
import { fetchCountriesSms, updateCountriesSms, showCountriesSmsLoadingError } from '../';
import { COUNTRIES_SMS_UPDATED, NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'meta sms-country-codes', () => {
		describe( '#fetchCountriesSms', () => {
			test( 'should dispatch HTTP request to meta/sms-country-codes', () => {
				const action = { type: 'DUMMY' };

				expect( fetchCountriesSms( action ) ).toEqual(
					expect.objectContaining(
						http(
							{
								apiVersion: '1.1',
								method: 'GET',
								path: '/meta/sms-country-codes/',
							},
							action
						)
					)
				);
			} );
		} );

		describe( '#updateCountriesSms', () => {
			test( 'should dispatch updated action', () => {
				const action = { type: 'DUMMY' };
				const data = [ 'BG', 'US', 'UK' ];

				expect( updateCountriesSms( action, data ) ).toMatchObject( {
					type: COUNTRIES_SMS_UPDATED,
					countries: data,
				} );
			} );
		} );

		describe( '#showCountriesSmsLoadingError', () => {
			test( 'should dispatch error notice', () => {
				expect( showCountriesSmsLoadingError() ).toMatchObject( {
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
