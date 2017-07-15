/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	addDraftShare,
	removeDraftShare,
	revokeDraftShare,
	restoreDraftShare,
	addDraftShareFeedback,
} from '../actions';
import {
	DRAFT_FEEDBACK_SHARE_ADD,
	DRAFT_FEEDBACK_SHARE_REMOVE,
	DRAFT_FEEDBACK_SHARE_REVOKE,
	DRAFT_FEEDBACK_SHARE_RESTORE,
	DRAFT_FEEDBACK_COMMENT_ADD,
} from 'state/action-types';

describe( 'actions', () => {
	const SITE_ID = 123;
	const POST_ID = 456;
	const EMAIL_ADDRESS = 'draft-feedback@test';

	describe( '#addDraftShare', () => {
		it( 'should return an action object', () => {
			const action = addDraftShare( SITE_ID, POST_ID, EMAIL_ADDRESS );

			expect( action ).to.eql( {
				type: DRAFT_FEEDBACK_SHARE_ADD,
				siteId: SITE_ID,
				postId: POST_ID,
				emailAddress: EMAIL_ADDRESS,
			} );
		} );
	} );

	describe( '#removeDraftShare', () => {
		it( 'should return an action object', () => {
			const action = removeDraftShare( SITE_ID, POST_ID, EMAIL_ADDRESS );

			expect( action ).to.eql( {
				type: DRAFT_FEEDBACK_SHARE_REMOVE,
				siteId: SITE_ID,
				postId: POST_ID,
				emailAddress: EMAIL_ADDRESS,
			} );
		} );
	} );

	describe( '#revokeDraftShare', () => {
		it( 'should return an action object', () => {
			const action = revokeDraftShare( SITE_ID, POST_ID, EMAIL_ADDRESS );

			expect( action ).to.eql( {
				type: DRAFT_FEEDBACK_SHARE_REVOKE,
				siteId: SITE_ID,
				postId: POST_ID,
				emailAddress: EMAIL_ADDRESS,
			} );
		} );
	} );

	describe( '#restoreDraftShare', () => {
		it( 'should return an action object', () => {
			const action = restoreDraftShare( SITE_ID, POST_ID, EMAIL_ADDRESS );

			expect( action ).to.eql( {
				type: DRAFT_FEEDBACK_SHARE_RESTORE,
				siteId: SITE_ID,
				postId: POST_ID,
				emailAddress: EMAIL_ADDRESS,
			} );
		} );
	} );

	describe( '#addDraftShareFeedback', () => {
		it( 'should return an action object', () => {
			const COMMENT = 'This is test feedback.';
			const action = addDraftShareFeedback( SITE_ID, POST_ID, EMAIL_ADDRESS, COMMENT );

			expect( action ).to.eql( {
				type: DRAFT_FEEDBACK_COMMENT_ADD,
				siteId: SITE_ID,
				postId: POST_ID,
				emailAddress: EMAIL_ADDRESS,
				comment: COMMENT,
			} );
		} );
	} );
} );
