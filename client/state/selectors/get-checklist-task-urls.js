/**
 * External dependencies
 */
import { find, get, some } from 'lodash';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { getPostsForQuery } from 'state/posts/selectors';
import getEditorUrl from 'state/selectors/get-editor-url';
import getFrontPageEditorUrl from 'state/selectors/get-front-page-editor-url';
import createSelector from 'lib/create-selector';
import { isEnabled } from 'config';

export const FIRST_TEN_SITE_POSTS_QUERY = { type: 'any', number: 10, order_by: 'ID', order: 'ASC' };

function getContactPage( posts ) {
	return get(
		find(
			posts,
			post =>
				post.type === 'page' &&
				( some( post.metadata, { key: '_headstart_post', value: '_hs_contact_page' } ) ||
					post.slug === 'contact' )
		),
		'ID',
		null
	);
}

function getPageEditorUrl( state, siteId, pageId ) {
	if ( ! pageId ) {
		return null;
	}

	return getEditorUrl( state, siteId, pageId, 'page' );
}

export default createSelector(
	( state, siteId ) => {
		const posts = getPostsForQuery( state, siteId, FIRST_TEN_SITE_POSTS_QUERY );
		const firstPostID = get( find( posts, { type: 'post' } ), [ 0, 'ID' ] );
		const contactPageUrl = getPageEditorUrl( state, siteId, getContactPage( posts ) );
		const frontPageUrl = getFrontPageEditorUrl( state, siteId );

		const updateHomepageUrl = isEnabled( 'checklist-homepage-template-select' )
			? addQueryArgs( frontPageUrl || getEditorUrl( state, siteId, null, 'page' ), {
					'new-homepage': 1,
			  } )
			: frontPageUrl;

		return {
			post_published: getPageEditorUrl( state, siteId, firstPostID ),
			contact_page_updated: contactPageUrl,
			about_text_updated: frontPageUrl,
			front_page_updated: updateHomepageUrl,
			homepage_photo_updated: frontPageUrl,
			business_hours_added: frontPageUrl,
			service_list_added: frontPageUrl,
			staff_info_added: frontPageUrl,
			product_list_added: frontPageUrl,
		};
	},
	( state, siteId ) => [ getPostsForQuery( state, siteId, FIRST_TEN_SITE_POSTS_QUERY ) ]
);
