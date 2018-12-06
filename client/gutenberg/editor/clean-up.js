/** @format */
/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

export default function cleanUpGutenberg() {
	debug( 'Starting Gutenberg editor clean-up...' );

	dispatch( 'core/edit-post' ).closePublishSidebar();
	dispatch( 'core/edit-post' ).closeModal();

	const notices = select( 'core/notices' ).getNotices();
	notices.forEach( ( { id } ) => dispatch( 'core/notices' ).removeNotice( id ) );

	debug( 'Gutenberg editor clean-up complete.' );
}
