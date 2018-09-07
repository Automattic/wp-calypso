/** @format */
/**
 * Internal dependencies
 */

import {
	GUTENBERG_SITE_CREATE_DRAFT,
	GUTENBERG_SITE_POST_REQUEST,
	GUTENBERG_SITE_POST_RECEIVE,
} from 'state/action-types';

import { createDraft, requestSitePost, receiveSitePost } from '../actions';

const SITE_ID = 91750058;
const POST_ID = 287;

describe( 'actions', () => {
	describe( 'createDraft()', () => {
		test( 'should return a create Gutenberg draft action', () => {
			const action = createDraft( SITE_ID );

			expect( action ).toMatchObject( {
				type: GUTENBERG_SITE_CREATE_DRAFT,
				siteId: SITE_ID,
			} );
		} );
	} );

	describe( 'requestSitePost()', () => {
		test( 'should return a request site post for Gutenberg action', () => {
			const action = requestSitePost( SITE_ID, POST_ID );

			expect( action ).toMatchObject( {
				type: GUTENBERG_SITE_POST_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
			} );
		} );
	} );

	describe( 'receiveSitePost()', () => {
		test( 'should return a recieve site post for Gutenberg action', () => {
			const action = receiveSitePost( SITE_ID, POST_ID, { id: POST_ID } );

			expect( action ).toMatchObject( {
				type: GUTENBERG_SITE_POST_RECEIVE,
				siteId: SITE_ID,
				postId: POST_ID,
				post: { id: POST_ID },
			} );
		} );
	} );
} );
