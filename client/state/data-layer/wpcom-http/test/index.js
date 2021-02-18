/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { failureMeta, queueRequest, successMeta } from '../';
import { extendAction } from 'calypso/state/utils';
import useNock, { nock } from 'calypso/test-helpers/use-nock';

const processInbound = ( action ) => action;
const processOutbound = ( action, store, data, error ) => ( {
	failures: [ action.onFailure ],
	nextData: data,
	nextError: error,
	successes: [ action.onSuccess ],
} );

const http = queueRequest( processInbound, processOutbound );

const succeeder = { type: 'SUCCESS' };
const failer = { type: 'FAIL' };

const getMe = {
	method: 'GET',
	path: '/me',
	apiVersion: 'v1.1',
	onFailure: failer,
	onSuccess: succeeder,
};

describe( '#queueRequest', () => {
	useNock();

	test( 'should call `onSuccess` when a response returns with data', () => {
		return new Promise( ( done ) => {
			const data = { value: 1 };
			nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me' ).reply( 200, data );

			const dispatch = ( action ) => {
				expect( action ).to.be.eql( extendAction( succeeder, successMeta( data ) ) );
				done();
			};

			http( { dispatch }, getMe );
		} );
	} );

	test( 'should call `onFailure` when a response returns with an error', () => {
		return new Promise( ( done ) => {
			const error = { error: 'bad' };
			nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me' ).replyWithError( error );

			const dispatch = ( action ) => {
				expect( action ).to.be.eql( extendAction( failer, failureMeta( error ) ) );
				done();
			};

			http( { dispatch }, getMe );
		} );
	} );
} );
