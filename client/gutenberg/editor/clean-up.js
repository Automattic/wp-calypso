/** @format */
/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';

export default function cleanUpGutenberg() {
	dispatch( 'core/edit-post' ).closePublishSidebar();
	dispatch( 'core/edit-post' ).closeModal();

	const notices = select( 'core/notices' ).getNotices();
	notices.forEach( ( { id } ) => dispatch( 'core/notices' ).removeNotice( id ) );
}
