/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	siteUpdatesRequestAction,
	siteUpdatesRequestSuccessAction,
	siteUpdatesReceiveAction,
	siteUpdatesRequestFailureAction
} from '../actions';
import {
	requestSiteUpdates
} from '../utils';

import { useSandbox } from 'test/helpers/use-sinon';

describe( 'utils', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( 'requestSiteUpdates()', () => {
		const exampleUpdates = {
			plugins: 1,
			total: 1,
		};
		const requestError = {
			error: 'get_update_data_error',
			message: 'There was an error while getting the update data for this site.',
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/updates' )
				.reply( 200, exampleUpdates )
				.get( '/rest/v1.1/sites/77203074/updates' )
				.reply( 500, requestError );
		} );

		it( 'should dispatch set action when thunk triggered', () => {
			requestSiteUpdates( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( siteUpdatesRequestAction( 2916284 ) );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestSiteUpdates( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( siteUpdatesRequestSuccessAction( 2916284 ) );
				expect( spy ).to.have.been.calledWith( siteUpdatesReceiveAction( 2916284, exampleUpdates ) );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSiteUpdates( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( siteUpdatesRequestFailureAction( 77203074, requestError.message ) );
			} );
		} );
	} );
} );
