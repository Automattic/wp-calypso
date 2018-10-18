/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { withSelect } from '@wordpress/data';
import { flowRight, get } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostType } from 'state/post-types/selectors';

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
		const { postStatus, postType, postTypeObject, translate } = this.props;
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
			return get( postTypeObject, 'labels.new_item' ) || translate( 'New ' );
		}
		return get( postTypeObject, 'labels.edit_item' ) || translate( 'Edit' );
	};

	render() {
		return <DocumentHead title={ this.getTitle() } />;
	}
}

export default flowRight(
	withSelect( select => {
		const { getCurrentPost } = select( 'core/editor' );
		const { status } = getCurrentPost();

		return {
			postStatus: status,
		};
	} ),
	connect( ( state, { postType } ) => {
		const siteId = getSelectedSiteId( state );
		return {
			postTypeObject: getPostType( state, siteId, postType ),
		};
	} )
)( localize( EditorDocumentHead ) );
