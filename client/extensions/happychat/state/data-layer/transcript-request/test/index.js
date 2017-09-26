/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
} from 'state/action-types';
import transcriptRequest from '../index';

describe( 'HAPPYCHAT_TRANSCRIPT_REQUEST action', () => {
	it( 'should fetch transcript from connection and dispatch receive action', () => {
		const response = {
			messages: [
				{ text: 'hello' }
			],
			timestamp: 100000,
		};

		const connection = { transcript: stub().returns( Promise.resolve( response ) ) };
		const dispatch = stub();
		const getState = stub().returns( {} );

		return transcriptRequest( connection )( { getState, dispatch } )
			.then( () => {
				expect( connection.transcript ).to.have.been.called;

				expect( dispatch ).to.have.been.calledWith( {
					type: HAPPYCHAT_TRANSCRIPT_RECEIVE,
					...response,
				} );
			} );
	} );
} );
