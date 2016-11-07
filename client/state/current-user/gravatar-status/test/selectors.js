/**
 * External dependencies
 */
import { expect } from 'chai';

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
} );
