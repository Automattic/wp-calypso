/**
 * Internal dependencies
 */
import { receiveGravatarImageFailed, uploadGravatar } from '../actions';
import {
	GRAVATAR_RECEIVE_IMAGE_FAILURE,
	GRAVATAR_UPLOAD_REQUEST,
} from 'calypso/state/action-types';

const dispatch = jest.fn();

describe( 'actions', () => {
	describe( '#uploadGravatar', () => {
		test( 'dispatches request action with the file and email', () => {
			const action = uploadGravatar( 'file', 'email' );
			expect( action.type ).toEqual( GRAVATAR_UPLOAD_REQUEST );
			expect( action.file ).toEqual( 'file' );
			expect( action.email ).toEqual( 'email' );
		} );
	} );

	describe( '#receiveGravatarImageFailed', () => {
		test( 'dispatches image receive failure action with error message', () => {
			const errorMessage = 'error';
			const statName = 'statName';
			receiveGravatarImageFailed( {
				errorMessage,
				statName,
			} )( dispatch );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: GRAVATAR_RECEIVE_IMAGE_FAILURE,
				errorMessage,
				meta: expect.any( Object ),
			} );
		} );
	} );
} );
