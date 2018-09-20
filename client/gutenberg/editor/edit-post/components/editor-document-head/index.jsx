/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getPostType } from 'state/post-types/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export const EditorDocumentHead = ( { isNewPost, postType, postTypeObject, translate } ) => {
	let title = '';
	if ( 'post' === postType ) {
		title = isNewPost ? translate( 'New Post' ) : translate( 'Edit Post' );
	} else if ( 'page' === postType ) {
		title = isNewPost ? translate( 'New Page' ) : translate( 'Edit Page' );
	} else if ( !! postTypeObject ) {
		title = isNewPost ? postTypeObject.labels.new_item : postTypeObject.labels.edit_item;
	} else {
		title = isNewPost ? translate( 'New' ) : translate( 'Edit' );
	}

	return <DocumentHead title={ title } />;
};

EditorDocumentHead.propTypes = {
	isNewPost: PropTypes.bool,
	postId: PropTypes.number,
	postType: PropTypes.string,
	postTypeObject: PropTypes.object,
};

const mapStateToProps = ( state, { postId, postType } ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isNewPost: ! postId,
		postTypeObject: getPostType( state, siteId, postType ),
	};
};

export default connect( mapStateToProps )( localize( EditorDocumentHead ) );
