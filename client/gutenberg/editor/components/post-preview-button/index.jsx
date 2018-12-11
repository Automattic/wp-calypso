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

export class PostPreviewButton extends Component {
	state = {
		iframeUrl: 'about:blank',
		isPreviewVisible: false,
	};

	componentDidUpdate( prevProps ) {
		this.setIframePreviewUrl( prevProps );
	}

	openPreviewModal = () => {
		const { autosave, isDraft, savePost } = this.props;

		if ( isDraft ) {
			savePost( { isPreview: true } );
		} else {
			autosave( { isPreview: true } );
		}

		this.setState( { isPreviewVisible: true } );
	};

	closePreviewModal = () => this.setState( { isPreviewVisible: false } );

	getIframePreviewUrl = () => {
		const { previewLink } = this.props;
		const parsed = url.parse( previewLink, true );
		parsed.query.preview = 'true';
		parsed.query.iframe = 'true';
		parsed.query.revision = String( this.props.revision );
		delete parsed.search;
		return url.format( parsed );
	};

	setIframePreviewUrl = prevProps => {
		if ( ! prevProps || ! this.props ) {
			return;
		}

		const { isSaving, previewLink } = this.props;

		if ( isSaving && ! prevProps.isSaving ) {
			// Started saving
			return this.setState( { iframeUrl: 'about:blank' } );
		}

		if ( ! previewLink ) {
			return;
		}

		if ( ! isSaving && prevProps.isSaving ) {
			// Finished saving
			return this.setState( { iframeUrl: this.getIframePreviewUrl() } );
		}
	};

	render() {
		const { currentPostLink } = this.props;
		const { iframeUrl, isPreviewVisible } = this.state;

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
					previewUrl={ iframeUrl }
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
			getEditedPostPreviewLink,
			isEditedPostAutosaveable,
			isEditedPostSaveable,
			isSavingPost,
		} = select( 'core/editor' );
		const { getPostType } = select( 'core' );

		const currentPostLink = getCurrentPostAttribute( 'link' );
		const postType = getPostType( getEditedPostAttribute( 'type' ) );
		const previewLink = getEditedPostPreviewLink();
		return {
			currentPostLink,
			isAutosaveable: isEditedPostAutosaveable(),
			isDraft: [ 'draft', 'auto-draft' ].indexOf( getEditedPostAttribute( 'status' ) ) !== -1,
			isSaveable: isEditedPostSaveable(),
			isSaving: isSavingPost(),
			isViewable: get( postType, [ 'viewable' ], false ),
			previewLink: previewLink || currentPostLink,
		};
	} ),
	withDispatch( dispatch => ( {
		autosave: dispatch( 'core/editor' ).autosave,
		savePost: dispatch( 'core/editor' ).savePost,
	} ) ),
	ifCondition( ( { isViewable } ) => isViewable ),
] )( PostPreviewButton );
