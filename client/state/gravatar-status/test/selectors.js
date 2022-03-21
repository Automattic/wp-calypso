import { expect } from 'chai';
import { isCurrentUserUploadingGravatar, getUserTempGravatar } from '../selectors';

describe( 'selectors', () => {
	describe( '#isCurrentUserUploadingGravatar', () => {
		test( 'returns state when defined', () => {
			const uploadingState = {
				gravatarStatus: {
					isUploading: true,
				},
			};
			expect( isCurrentUserUploadingGravatar( uploadingState ) ).to.equal( true );

			const notUploadingState = {
				gravatarStatus: {
					isUploading: false,
				},
			};
			expect( isCurrentUserUploadingGravatar( notUploadingState ) ).to.equal( false );
		} );
	} );

	describe( '#getUserTempGravatar', () => {
		const tempImage = 'image';
		const currentUserId = 1;
		const anotherUserId = 2;

		test( 'returns false if user ID is not passed in, or is false', () => {
			const state = {
				currentUser: {
					id: currentUserId,
				},
				gravatarStatus: {
					tempImage,
				},
			};
			expect( getUserTempGravatar( state ) ).to.equal( false );
			expect( getUserTempGravatar( state, false ) ).to.equal( false );
		} );

		test( 'returns false if the user ID passed is not the current user ID', () => {
			const state = {
				currentUser: {
					id: currentUserId,
				},
				gravatarStatus: {
					tempImage,
				},
			};
			expect( getUserTempGravatar( state, anotherUserId ) ).to.equal( false );
		} );

		test( 'returns false if the current user does not have temp image set', () => {
			const emptyTempImage = {
				currentUser: {
					id: currentUserId,
				},
				gravatarStatus: {
					tempImage: null,
				},
			};
			expect( getUserTempGravatar( emptyTempImage, currentUserId ) ).to.equal( false );
		} );

		test( 'returns image src if given the current user ID, and the current user has a temp image set', () => {
			const state = {
				currentUser: {
					id: currentUserId,
				},
				gravatarStatus: {
					tempImage,
				},
			};
			expect( getUserTempGravatar( state, currentUserId ) ).to.equal( tempImage );
		} );
	} );
} );
