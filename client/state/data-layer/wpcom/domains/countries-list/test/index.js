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
import { COUNTRIES_DOMAINS_UPDATED, NOTICE_CREATE } from 'state/action-types';
import {
	fetchCountriesDomains,
	updateCountriesDomains,
	showCountriesDomainsLoadingError,
} from '../';

describe( 'wpcom-api', () => {
	describe( 'domains countries-list', () => {
		describe( '#fetchCountriesDomains', () => {
			it( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();

				fetchCountriesDomains( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
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
			it( 'should dispatch updated action', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const data = [ 'BG', 'US', 'UK' ];

				updateCountriesDomains( { dispatch }, action, data );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: COUNTRIES_DOMAINS_UPDATED,
					countries: data,
				} );
			} );
		} );

		describe( '#showCountriesDomainsLoadingError', () => {
			it( 'should dispatch error notice', () => {
				const dispatch = spy();

				showCountriesDomainsLoadingError( { dispatch } );

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
