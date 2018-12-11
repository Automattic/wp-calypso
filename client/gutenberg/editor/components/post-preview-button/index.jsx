/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { get } from 'lodash';
import url from 'url';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { ifCondition, compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import { isEnabled } from 'config';

export class PostPreviewButton extends Component {
	state = {
		isPreviewVisible: false,
	};

	openPreviewModal = () => this.setState( { isPreviewVisible: true } );

	closePreviewModal = () => this.setState( { isPreviewVisible: false } );

	getIframePreviewUrl = () => {
		const { previewLink } = this.props;
		const parsed = url.parse( previewLink, true );
		parsed.query.preview = 'true';
		parsed.query.iframe = 'true';
		parsed.query.revision = String( this.props.revision );
		// Scroll to the main post content.
		if ( this.props.postId && isEnabled( 'post-editor/preview-scroll-to-content' ) ) {
			// Vary the URL hash based on whether the preview is shown.  When
			// the preview is hidden then re-shown, we want to be sure to
			// scroll to the content section again even if the preview has not
			// reloaded in the meantime, which is most easily accomplished by
			// changing the URL hash.  This does not cause a page reload.
			if ( this.props.showPreview ) {
				parsed.hash = 'post-' + this.props.postId;
			} else {
				parsed.hash = '__preview-hidden';
			}
		}
		delete parsed.search;
		return url.format( parsed );
	};

	render() {
		const { currentPostLink } = this.props;
		const { isPreviewVisible } = this.state;

		return (
			<Fragment>
				<Button
					className="editor-post-preview"
					disabled={ false }
					isLarge
					onClick={ this.openPreviewModal }
				>
					{ _x( 'Preview', 'imperative verb' ) }
					<span className="screen-reader-text">
						{ /* translators: accessibility text */
						__( '(opens in a new tab)' ) }
					</span>
				</Button>
				<WebPreview
					externalUrl={ currentPostLink }
					onClose={ this.closePreviewModal }
					previewUrl={ this.getIframePreviewUrl() }
					showPreview={ isPreviewVisible }
				/>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( select => {
		const {
			getCurrentPostAttribute,
			getEditedPostAttribute,
			isEditedPostSaveable,
			isEditedPostAutosaveable,
			getEditedPostPreviewLink,
		} = select( 'core/editor' );
		const { getPostType } = select( 'core' );

		const currentPostLink = getCurrentPostAttribute( 'link' );
		const postType = getPostType( getEditedPostAttribute( 'type' ) );
		const previewLink = getEditedPostPreviewLink();
		return {
			currentPostLink,
			previewLink: previewLink || currentPostLink,
			isSaveable: isEditedPostSaveable(),
			isAutosaveable: isEditedPostAutosaveable(),
			isViewable: get( postType, [ 'viewable' ], false ),
			isDraft: [ 'draft', 'auto-draft' ].indexOf( getEditedPostAttribute( 'status' ) ) !== -1,
		};
	} ),
	withDispatch( dispatch => ( {
		autosave: dispatch( 'core/editor' ).autosave,
		savePost: dispatch( 'core/editor' ).savePost,
	} ) ),
	ifCondition( ( { isViewable } ) => isViewable ),
] )( PostPreviewButton );
