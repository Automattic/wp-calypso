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
import { fetchCountries, handleSuccess, handleError } from '../';

describe( 'wpcom-api', () => {
	describe( 'domains countries-list', () => {
		describe( '#fetchCountries', () => {
			it( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();

				fetchCountries( { dispatch }, action );

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

		describe( '#handleSuccess', () => {
			it( 'should dispatch updated action', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const data = [ 'BG', 'US', 'UK' ];

				handleSuccess( { dispatch }, action, data );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: COUNTRIES_DOMAINS_UPDATED,
					countries: data,
				} );
			} );
		} );

		describe( '#handleError', () => {
			it( 'should dispatch error notice', () => {
				const dispatch = spy();

				handleError( { dispatch } );

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
