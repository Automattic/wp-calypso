/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';

//TODO: CPT support once https://github.com/Automattic/wp-calypso/issues/27430 is fixed
export class EditorDocumentHead extends Component {
	static propTypes = {
		postStatus: PropTypes.string,
		postType: PropTypes.string,
	};

	shouldComponentUpdate( nextProps ) {
		if ( 'auto-draft' === this.props.postStatus && 'draft' === nextProps.postStatus ) {
			return false;
		}
		return this.props.postStatus !== nextProps.postStatus;
	}

	isNewPost = () => 'auto-draft' === this.props.postStatus;

	getTitle = () => {
		const { postStatus, postType, translate } = this.props;
		if ( ! postStatus ) {
			return '';
		}
		const isNewPost = this.isNewPost();
		if ( 'post' === postType && isNewPost ) {
			return translate( 'New Post' );
		}
		if ( 'post' === postType && ! isNewPost ) {
			return translate( 'Edit Post' );
		}
		if ( 'page' === postType && isNewPost ) {
			return translate( 'New Page' );
		}
		if ( 'page' === postType && ! isNewPost ) {
			return translate( 'Edit Page' );
		}
		if ( isNewPost ) {
			return translate( 'New ' );
		}
		return translate( 'Edit' );
	};

	render() {
		return <DocumentHead title={ this.getTitle() } />;
	}
}

export default withSelect( select => {
	const { getCurrentPost } = select( 'core/editor' );
	const { status } = getCurrentPost();

	return {
		postStatus: status,
	};
} )( localize( EditorDocumentHead ) );
