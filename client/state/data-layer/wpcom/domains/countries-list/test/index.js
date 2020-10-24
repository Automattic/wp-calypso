/**
 * Internal dependencies
 */
import {
	fetchCountriesDomains,
	updateCountriesDomains,
	showCountriesDomainsLoadingError,
} from '../';
import { COUNTRIES_DOMAINS_UPDATED, NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'domains countries-list', () => {
		describe( '#fetchCountriesDomains', () => {
			test( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };

				expect( fetchCountriesDomains( action ) ).toEqual(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/domains/supported-countries/',
						},
						action
					)
				);
			} );
		} );

		describe( '#updateCountriesDomains', () => {
			test( 'should dispatch updated action', () => {
				const action = { type: 'DUMMY' };
				const data = [ 'BG', 'US', 'UK' ];

				expect( updateCountriesDomains( action, data ) ).toEqual( {
					type: COUNTRIES_DOMAINS_UPDATED,
					countries: data,
				} );
			} );
		} );

		describe( '#showCountriesDomainsLoadingError', () => {
			test( 'should dispatch error notice', () => {
				expect( showCountriesDomainsLoadingError() ).toEqual(
					expect.objectContaining( {
						type: NOTICE_CREATE,
						notice: expect.objectContaining( {
							status: 'is-error',
							text: "We couldn't load the countries list.",
						} ),
					} )
				);
			} );
		} );
	} );
} );
