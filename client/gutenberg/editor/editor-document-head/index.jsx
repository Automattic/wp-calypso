/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';

//TODO: CPT support once https://github.com/Automattic/wp-calypso/issues/27430 is fixed
export const EditorDocumentHead = ( { isNewPost, postType, translate } ) => {
	let title = '';
	if ( 'post' === postType ) {
		title = isNewPost ? translate( 'New Post' ) : translate( 'Edit Post' );
	} else if ( 'page' === postType ) {
		title = isNewPost ? translate( 'New Page' ) : translate( 'Edit Page' );
	} else {
		title = isNewPost ? translate( 'New' ) : translate( 'Edit' );
	}

	return <DocumentHead title={ title } />;
};

EditorDocumentHead.propTypes = {
	isNewPost: PropTypes.bool,
	postType: PropTypes.string,
};

export default withSelect( select => {
	const { getCurrentPost } = select( 'core/editor' );
	const { status } = getCurrentPost();

	return {
		isNewPost: status === 'auto-draft',
	};
} )( localize( EditorDocumentHead ) );
