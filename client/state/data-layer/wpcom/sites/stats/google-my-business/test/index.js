/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST } from 'state/action-types';
import { fetchGoogleMyBusinessStats, receiveStats } from '../';
import { receiveGoogleMyBusinessStats } from 'state/google-my-business/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( '#fetchGoogleMyBusinessStatsSearch', () => {
	test( 'should dispatch HTTP request to users endpoint', () => {
		const action = {
			type: GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST,
			timeSpan: 'week',
			siteId: 12345,
			statName: 'search',
		};
		const dispatch = sinon.spy();

		fetchGoogleMyBusinessStats( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					path: '/sites/12345/google-my-business/search',
					method: 'GET',
					apiNamespace: 'wp/v1',
					query: {
						time_span: 'week',
					},
				},
				action
			)
		);
	} );
} );

describe( '#receiveStats', () => {
	test( 'should dispatch recieve stats action', () => {
		const dispatch = sinon.spy();
		receiveStats( { dispatch }, {}, { hello: 'world' } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			receiveGoogleMyBusinessStats( { hello: 'world' } )
		);
	} );

	test( 'should transform data snake_case to camelCase', () => {
		const dispatch = sinon.spy();
		receiveStats( { dispatch }, {}, { hello_world: 'hello' } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			receiveGoogleMyBusinessStats( { helloWorld: 'hello' } )
		);
	} );
} );
