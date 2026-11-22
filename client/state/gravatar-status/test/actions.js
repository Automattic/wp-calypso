import { GRAVATAR_UPLOAD_REQUEST } from 'calypso/state/action-types';
import { uploadGravatar } from '../actions';

describe( 'actions', () => {
	describe( '#uploadGravatar', () => {
		test( 'dispatches request action with the file and email', () => {
			const action = uploadGravatar( 'file', 'email' );
			expect( action.type ).toEqual( GRAVATAR_UPLOAD_REQUEST );
			expect( action.file ).toEqual( 'file' );
			expect( action.email ).toEqual( 'email' );
		} );
	} );
} );
