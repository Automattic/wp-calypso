/** @format */
/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { requestSitePost } from 'state/data-getters';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

export default function cleanUpGutenberg( siteId, postId, postType ) {
	debug( 'Starting Gutenberg editor clean-up...' );

	if ( siteId && postId && postType ) {
		requestSitePost( siteId, postId, postType, 0 );
	}

	dispatch( 'core/edit-post' ).closePublishSidebar();
	dispatch( 'core/edit-post' ).closeModal();

	const notices = select( 'core/notices' ).getNotices();
	notices.forEach( ( { id } ) => dispatch( 'core/notices' ).removeNotice( id ) );

	debug( 'Gutenberg editor clean-up complete.' );
}
