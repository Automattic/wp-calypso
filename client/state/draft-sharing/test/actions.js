/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_SHARE_A_DRAFT_REQUEST,
	POST_SHARE_A_DRAFT_ADD,
	POST_SHARE_A_DRAFT_ENABLE,
	POST_SHARE_A_DRAFT_DISABLE,
} from 'state/action-types';
import {
	requestDraftSharing,
	addDraftSharing,
	enableDraftSharing,
	disableDraftSharing,
} from '../actions';

describe( 'actions', () => {
	const SITE_ID = 123;
	const POST_ID = 456;

	describe( '#requestDraftSharing', () => {
		it( 'should return an action object', () => {
			const action = requestDraftSharing( SITE_ID, POST_ID );

			expect( action ).to.eql( {
				type: POST_SHARE_A_DRAFT_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
			} );
		} );
	} );
	describe( '#addDraftSharing', () => {
		it( 'should return an action object', () => {
			const draftShare = {
				isEnabled: true,
				link: 'test-link',
			};
			const action = addDraftSharing( SITE_ID, POST_ID, draftShare );

			expect( action ).to.eql( {
				type: POST_SHARE_A_DRAFT_ADD,
				siteId: SITE_ID,
				postId: POST_ID,
				isEnabled: draftShare.isEnabled,
				link: draftShare.link,
			} );
		} );
	} );
	describe( '#enableDraftSharing', () => {
		it( 'should return an action object', () => {
			const action = enableDraftSharing( SITE_ID, POST_ID );

			expect( action ).to.eql( {
				type: POST_SHARE_A_DRAFT_ENABLE,
				siteId: SITE_ID,
				postId: POST_ID,
			} );
		} );
	} );
	describe( '#disableDraftSharing', () => {
		it( 'should return an action object', () => {
			const action = disableDraftSharing( SITE_ID, POST_ID );

			expect( action ).to.eql( {
				type: POST_SHARE_A_DRAFT_DISABLE,
				siteId: SITE_ID,
				postId: POST_ID,
			} );
		} );
	} );
} );
