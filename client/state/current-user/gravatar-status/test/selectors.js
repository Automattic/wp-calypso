/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isCurrentUserUploadingGravatar
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isCurrentUserUploadingGravatar', () => {
		it( 'returns false when state is undefined', () => {
			expect( isCurrentUserUploadingGravatar( undefined ) ).to.equal( false );
		} );

		it( 'returns state when defined', () => {
			const uploadingState = {};
			set( uploadingState, 'currentUser.gravatarStatus.isUploading', true );
			expect( isCurrentUserUploadingGravatar( uploadingState ) )
				.to.equal( true );

			const notUploadingState = {};
			set( notUploadingState, 'currentUser.gravatarStatus.isUploading', false );
			expect( isCurrentUserUploadingGravatar( notUploadingState ) )
				.to.equal( false );
		} );
	} );
} );
