/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchCountriesSms, updateCountriesSms, showCountriesSmsLoadingError } from '../';
import { COUNTRIES_SMS_UPDATED, NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'meta sms-country-codes', () => {
		describe( '#fetchCountriesSms', () => {
			test( 'should dispatch HTTP request to plans endpoint', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();

				fetchCountriesSms( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith(
					http(
						{
							apiVersion: '1.1',
							method: 'GET',
							path: '/meta/sms-country-codes/',
						},
						action
					)
				);
			} );
		} );

		describe( '#updateCountriesSms', () => {
			test( 'should dispatch updated action', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const data = [ 'BG', 'US', 'UK' ];

				updateCountriesSms( { dispatch }, action, data );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: COUNTRIES_SMS_UPDATED,
					countries: data,
				} );
			} );
		} );

		describe( '#showCountriesSmsLoadingError', () => {
			test( 'should dispatch error notice', () => {
				const dispatch = spy();

				showCountriesSmsLoadingError( { dispatch } );

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
