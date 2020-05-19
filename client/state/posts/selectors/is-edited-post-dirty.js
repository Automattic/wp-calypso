/**
 * External dependencies
 */
import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { DEFAULT_NEW_POST_VALUES } from 'state/posts/constants';
import { getPostEdits } from 'state/posts/selectors/get-post-edits';
import { getSitePost } from 'state/posts/selectors/get-site-post';
import {
	getFeaturedImageId,
	isAuthorEqual,
	isDateEqual,
	isDiscussionEqual,
	areAllMetadataEditsApplied,
} from 'state/posts/utils';

import 'state/posts/init';

/**
 * Returns true if there are "dirty" edited fields to be saved for the post
 * corresponding with the site ID post ID pair, or false otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Whether dirty fields exist
 */
export const isEditedPostDirty = createSelector(
	( state, siteId, postId ) => {
		const post = getSitePost( state, siteId, postId );
		const edits = getPostEdits( state, siteId, postId );

		const editsDirty = some( edits, ( value, key ) => {
			if ( key === 'type' ) {
				return false;
			}

			if ( post ) {
				switch ( key ) {
					case 'author': {
						return ! isAuthorEqual( value, post.author );
					}
					case 'date': {
						return ! isDateEqual( value, post.date );
					}
					case 'discussion': {
						return ! isDiscussionEqual( value, post.discussion );
					}
					case 'featured_image': {
						return value !== getFeaturedImageId( post );
					}
					case 'metadata': {
						return ! areAllMetadataEditsApplied( value, post.metadata );
					}
					case 'parent': {
						return get( post, 'parent.ID', 0 ) !== value;
					}
				}
				return post[ key ] !== value;
			}

			return ! ( key in DEFAULT_NEW_POST_VALUES ) || value !== DEFAULT_NEW_POST_VALUES[ key ];
		} );

		const { initial, current } = state.ui.editor.rawContent;
		const rawContentDirty = initial !== current;
		return editsDirty || rawContentDirty;
	},
	( state ) => [ state.posts.queries, state.posts.edits, state.ui.editor.rawContent ]
);
