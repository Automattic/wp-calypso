/** @format */

/**
 * Internal dependencies
 */
import {
	GUTENBERG_SITE_CREATE_DRAFT,
	GUTENBERG_SITE_POST_REQUEST,
	GUTENBERG_SITE_POST_RECEIVE,
} from 'state/action-types';
import {
	requestGutenbergPostDraft,
	createSitePostSuccess,
	fetchSitePost,
	fetchSitePostSuccess,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

const SITE_ID = 91750058;
const POST_ID = 287;

describe( 'wp-api', () => {
	describe( 'Gutenberg site posts', () => {
		describe( 'requestGutenbergPostDraft()', () => {
			test( "should dispatch a HTTP request to Gutenberg's create draft endpoint", () => {
				const dispatch = jest.fn();
				const action = { type: GUTENBERG_SITE_CREATE_DRAFT, siteId: SITE_ID };

				requestGutenbergPostDraft( { dispatch }, action );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith(
					http(
						{
							path: `/sites/${ SITE_ID }/posts/create-draft`,
							method: 'GET',
							apiNamespace: 'wp/v2',
						},
						action
					)
				);
			} );
		} );

		describe( 'createSitePostSuccess()', () => {
			test( 'should dispatch an action to request the created post for Gutenberg', () => {
				const dispatch = jest.fn();

				createSitePostSuccess( { dispatch }, { siteId: SITE_ID }, { ID: POST_ID } );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( {
					type: GUTENBERG_SITE_POST_REQUEST,
					siteId: SITE_ID,
					postId: POST_ID,
				} );
			} );
		} );

		describe( 'fetchSitePost()', () => {
			test( 'should dispatch a HTTP request to fetch a post for Gutenberg', () => {
				const dispatch = jest.fn();
				const action = { type: GUTENBERG_SITE_POST_REQUEST, siteId: SITE_ID, postId: POST_ID };

				fetchSitePost( { dispatch }, action );
				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith(
					http(
						{
							path: `/sites/${ SITE_ID }/posts/${ POST_ID }?context=edit`,
							method: 'GET',
							apiNamespace: 'wp/v2',
						},
						action
					)
				);
			} );
		} );

		describe( 'fetchSitePostSuccess()', () => {
			test( "should dispatch an action to update Gutenberg's current post", () => {
				const dispatch = jest.fn();

				fetchSitePostSuccess( { dispatch }, { siteId: SITE_ID, postId: POST_ID }, { id: POST_ID } );

				expect( dispatch ).toHaveBeenCalledTimes( 1 );
				expect( dispatch ).toHaveBeenCalledWith( {
					type: GUTENBERG_SITE_POST_RECEIVE,
					siteId: SITE_ID,
					postId: POST_ID,
					post: { id: POST_ID },
				} );
			} );
		} );
	} );
} );
