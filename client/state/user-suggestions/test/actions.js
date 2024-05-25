import deepFreeze from 'deep-freeze';
import nock from 'nock';
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { receiveUserSuggestions, requestUserSuggestions } from '../actions';
import sampleSuccessResponse from './sample-response.json';

const siteId = 123;

describe( 'actions', () => {
	describe( '#receiveUserSuggestions()', () => {
		test( 'should return an action object', () => {
			const suggestions = [];
			const action = receiveUserSuggestions( siteId, suggestions );

			expect( action ).toEqual( {
				type: USER_SUGGESTIONS_RECEIVE,
				siteId,
				suggestions,
			} );
		} );
	} );

	describe( '#requestUserSuggestions', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/users/suggest?site_id=' + siteId )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		test( 'should dispatch properly when receiving a valid response', async () => {
			const dispatchSpy = jest.fn( ( arg ) => arg );
			const request = requestUserSuggestions( siteId )( dispatchSpy );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: USER_SUGGESTIONS_REQUEST,
				siteId,
			} );

			await request;

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: USER_SUGGESTIONS_REQUEST_SUCCESS,
				data: sampleSuccessResponse,
				siteId,
			} );

			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: USER_SUGGESTIONS_RECEIVE,
				suggestions: sampleSuccessResponse.suggestions,
				siteId,
			} );
		} );
	} );
} );
