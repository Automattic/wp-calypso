/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isCurrentUserUploadingGravatar,
	getUserTempGravatar,
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

	describe( '#getUserTempGravatar', () => {
		it( 'returns false if user ID is not passed in', () => {
			const state = {};
			set( state, 'currentUser.gravatarStatus.tempImage.src', 'image' );
			set( state, 'currentUser.id', 987612 );
			expect( getUserTempGravatar( state ) ).to.equal( false );
		} );

		it( 'returns false if the user ID passed is not the current user ID', () => {
			const state = {};
			set( state, 'currentUser.gravatarStatus.tempImage.src', 'image' );
			set( state, 'currentUser.id', 1 );
			expect( getUserTempGravatar( state, 2 ) ).to.equal( false );
		} );

		it( 'returns false if the current user does not have temp image set', () => {
			const currentUserId = 1;

			const emptyTempImage = {};
			set( emptyTempImage, 'currentUser.id', currentUserId );
			set( emptyTempImage, 'currentUser.gravatarStatus.tempImage', {} );
			expect( getUserTempGravatar( emptyTempImage, currentUserId ) )
				.to.equal( false );

			const missingGravatarStatus = {};
			set( missingGravatarStatus, 'currentUser.id', currentUserId );
			expect( getUserTempGravatar( missingGravatarStatus, currentUserId ) )
				.to.equal( false );
		} );

		it( 'returns image src if given the current user ID, and the current user has a temp image set', () => {
			const currentUserId = 1;
			const state = {};
			const imageSrc = 'image';
			set( state, 'currentUser.gravatarStatus.tempImage.src', imageSrc );
			set( state, 'currentUser.id', currentUserId );
			expect( getUserTempGravatar( state, currentUserId ) ).to.equal( imageSrc );
		} );
	} );
} );
