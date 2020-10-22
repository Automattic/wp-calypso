/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { receiveGravatarImageFailed, uploadGravatar } from '../actions';
import {
	GRAVATAR_RECEIVE_IMAGE_FAILURE,
	GRAVATAR_UPLOAD_REQUEST,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( '#uploadGravatar', () => {
		test( 'dispatches request action with the file and email', () => {
			const action = uploadGravatar( 'file', 'email' );
			expect( action.type ).to.equal( GRAVATAR_UPLOAD_REQUEST );
			expect( action.file ).to.equal( 'file' );
			expect( action.email ).to.equal( 'email' );
		} );
	} );

	describe( '#receiveGravatarImageFailed', () => {
		test( 'dispatches image receive failure action with error message', () => {
			const errorMessage = 'error';
			const statName = 'statName';
			const result = receiveGravatarImageFailed( {
				errorMessage,
				statName,
			} );
			expect( result ).to.have.property( 'type', GRAVATAR_RECEIVE_IMAGE_FAILURE );
			expect( result ).to.have.property( 'errorMessage', errorMessage );
			expect( result ).to.have.property( 'meta' );
		} );
	} );
} );
