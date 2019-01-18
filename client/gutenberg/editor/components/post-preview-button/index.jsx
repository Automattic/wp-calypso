/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';
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
import ScreenReaderText from 'components/screen-reader-text';
import WebPreview from 'components/web-preview';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';

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
		const { frameNonce, previewLink, revisionsCount } = this.props;

		const parsed = url.parse( previewLink, true );
		if ( frameNonce ) {
			parsed.query[ 'frame-nonce' ] = frameNonce;
		}
		parsed.query.preview = 'true';
		parsed.query.iframe = 'true';
		parsed.query.revision = String( revisionsCount );
		delete parsed.search;
		return url.format( parsed );
	};

	setIframePreviewUrl = prevProps => {
		if ( ! prevProps || ! this.props ) {
			return;
		}

		const { isSaving } = this.props;

		if ( isSaving && ! prevProps.isSaving ) {
			// Started saving
			return this.setState( { iframeUrl: 'about:blank' } );
		}

		if ( ! isSaving && prevProps.isSaving ) {
			// Finished saving
			return this.setState( { iframeUrl: this.getIframePreviewUrl() } );
		}
	};

	render() {
		const { currentPostLink, editedPost, isCleanNewPost } = this.props;
		const { iframeUrl, isPreviewVisible } = this.state;

		return (
			<Fragment>
				<Button
					className="editor-post-preview"
					disabled={ isCleanNewPost }
					isLarge
					onClick={ this.openPreviewModal }
				>
					{ _x( 'Preview', 'imperative verb' ) }
					<ScreenReaderText>
						{ /* translators: accessibility text */
						__( '(opens in a new tab)' ) }
					</ScreenReaderText>
				</Button>
				<WebPreview
					externalUrl={ currentPostLink }
					onClose={ this.closePreviewModal }
					overridePost={ editedPost }
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
			getCurrentPostRevisionsCount,
			getEditedPostAttribute,
			getEditedPostPreviewLink,
			isCleanNewPost,
			isEditedPostAutosaveable,
			isEditedPostSaveable,
			isSavingPost,
		} = select( 'core/editor' );
		const { getAuthors, getMedia, getPostType } = select( 'core' );

		const currentPostLink = getCurrentPostAttribute( 'link' );
		const postType = getPostType( getEditedPostAttribute( 'type' ) );
		const previewLink = getEditedPostPreviewLink();
		const featuredImageId = getEditedPostAttribute( 'featured_media' );

		const featuredImage = featuredImageId
			? get( getMedia( featuredImageId ), 'source_url', null )
			: null;
		const author = find( getAuthors(), { id: getCurrentPostAttribute( 'author' ) } );

		const editedPost = {
			title: getEditedPostAttribute( 'title' ),
			URL: getEditedPostAttribute( 'link' ),
			excerpt: getEditedPostAttribute( 'excerpt' ),
			content: getEditedPostAttribute( 'content' ),
			featured_image: featuredImage,
			author,
		};

		return {
			currentPostLink,
			editedPost,
			isAutosaveable: isEditedPostAutosaveable(),
			isDraft: [ 'draft', 'auto-draft' ].indexOf( getEditedPostAttribute( 'status' ) ) !== -1,
			isCleanNewPost: isCleanNewPost(),
			isSaveable: isEditedPostSaveable(),
			isSaving: isSavingPost(),
			isViewable: get( postType, [ 'viewable' ], false ),
			revisionsCount: getCurrentPostRevisionsCount(),
			previewLink: previewLink || currentPostLink,
		};
	} ),
	withDispatch( dispatch => ( {
		autosave: dispatch( 'core/editor' ).autosave,
		savePost: dispatch( 'core/editor' ).savePost,
	} ) ),
	ifCondition( ( { isViewable } ) => isViewable ),
] )(
	connect( state => ( {
		frameNonce: getSiteOption( state, getSelectedSiteId( state ), 'frame_nonce' ),
	} ) )( PostPreviewButton )
);
