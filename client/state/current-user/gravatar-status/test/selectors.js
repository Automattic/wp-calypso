/**
 * External dependencies
 */
import { expect } from 'chai';

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
			const uploadingState = {
				currentUser: {
					gravatarStatus: {
						isUploading: true
					}
				}
			};
			expect( isCurrentUserUploadingGravatar( uploadingState ) )
				.to.equal( true );

			const notUploadingState = {
				currentUser: {
					gravatarStatus: {
						isUploading: false
					}
				}
			};
			expect( isCurrentUserUploadingGravatar( notUploadingState ) )
				.to.equal( false );
		} );
	} );

	describe( '#getUserTempGravatar', () => {
		const imageSrc = 'image';
		const currentUserId = 1;
		const anotherUserId = 2;

		it( 'returns false if user ID is not passed in, or is false', () => {
			const state = {
				currentUser: {
					gravatarStatus: {
						tempImage: {
							src: imageSrc
						}
					},
					id: currentUserId
				}
			};
			expect( getUserTempGravatar( state ) ).to.equal( false );
			expect( getUserTempGravatar( state, false ) ).to.equal( false );
		} );

		it( 'returns false if the user ID passed is not the current user ID', () => {
			const state = {
				currentUser: {
					gravatarStatus: {
						tempImage: {
							src: imageSrc
						}
					},
					id: currentUserId
				}
			};
			expect( getUserTempGravatar( state, anotherUserId ) ).to.equal( false );
		} );

		it( 'returns false if the current user does not have temp image set', () => {
			const emptyTempImage = {
				currentUser: {
					gravatarStatus: {
						tempImage: {}
					},
					id: currentUserId
				}
			};
			expect( getUserTempGravatar( emptyTempImage, currentUserId ) )
				.to.equal( false );
		} );

		it( 'returns image src if given the current user ID, and the current user has a temp image set', () => {
			const state = {
				currentUser: {
					gravatarStatus: {
						tempImage: {
							src: imageSrc
						}
					},
					id: currentUserId
				}
			};
			expect( getUserTempGravatar( state, currentUserId ) ).to.equal( imageSrc );
		} );
	} );
} );
