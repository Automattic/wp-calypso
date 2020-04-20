/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import MediaActions from 'lib/media/actions';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import EditorFeaturedImagePreviewContainer from './preview-container';
import FeaturedImageDropZone from './dropzone';
import isDropZoneVisible from 'state/selectors/is-drop-zone-visible';
import { Button } from '@automattic/components';
import RemoveButton from 'components/remove-button';
import getMediaItem from 'state/selectors/get-media-item';
import { getFeaturedImageId } from 'state/posts/utils';
import QueryMedia from 'components/data/query-media';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { editPost } from 'state/posts/actions';

/**
 * Style dependencies
 */
import './style.scss';

class EditorFeaturedImage extends Component {
	static propTypes = {
		featuredImage: PropTypes.object,
		hasDropZone: PropTypes.bool,
		isDropZoneVisible: PropTypes.bool,
		maxWidth: PropTypes.number,
		recordTracksEvent: PropTypes.func,
		selecting: PropTypes.bool,
		translate: PropTypes.func,
		onImageSelected: PropTypes.func,
	};

	static defaultProps = {
		hasDropZone: false,
		isDropZoneVisible: false,
		maxWidth: 450,
		onImageSelected: noop,
	};

	state = {
		isSelecting: false,
	};

	showMediaModal = () => {
		const { siteId, featuredImage } = this.props;

		if ( featuredImage ) {
			MediaActions.setLibrarySelectedItems( siteId, [ featuredImage ] );
		}

		this.setState( {
			isSelecting: true,
		} );
	};

	hideMediaModal = () => {
		this.setState( {
			isSelecting: false,
		} );
	};

	setImage = ( value ) => {
		this.hideMediaModal();
		this.props.onImageSelected();

		if ( ! value ) {
			return;
		}

		this.props.editPost( this.props.siteId, this.props.postId, {
			featured_image: value.items[ 0 ].ID,
		} );

		this.props.recordEditorStat( 'featured_image_set' );
		this.props.recordEditorEvent( 'Featured image set' );

		this.props.recordTracksEvent( 'calypso_editor_featured_image_upload', {
			source: 'medialibrary',
			type: 'click',
		} );
	};

	removeImage = () => {
		this.props.editPost( this.props.siteId, this.props.postId, { featured_image: '' } );

		this.props.recordEditorStat( 'featured_image_removed' );
		this.props.recordEditorEvent( 'Featured image removed' );
	};

	// called when media library item transitions from temporary ID to a permanent ID, e.g.,
	// after creating an item by uploading or selecting from Google library.
	onImageChange = ( imageId ) => {
		if ( imageId !== this.props.featuredImageId ) {
			this.props.editPost( this.props.siteId, this.props.postId, {
				featured_image: imageId,
			} );
		}
	};

	renderMediaModal() {
		if ( ! this.props.siteId ) {
			return;
		}

		return (
			<MediaLibrarySelectedData siteId={ this.props.siteId }>
				<MediaModal
					visible={ this.props.selecting || this.state.isSelecting }
					onClose={ this.setImage }
					siteId={ this.props.siteId }
					labels={ { confirm: this.props.translate( 'Set Featured Image' ) } }
					enabledFilters={ [ 'images' ] }
					single
				/>
			</MediaLibrarySelectedData>
		);
	}

	renderCurrentImage() {
		const { siteId, featuredImageId } = this.props;

		if ( ! featuredImageId ) {
			return;
		}

		return (
			<EditorFeaturedImagePreviewContainer
				siteId={ siteId }
				itemId={ featuredImageId }
				maxWidth={ this.props.maxWidth }
				onImageChange={ this.onImageChange }
			/>
		);
	}

	render() {
		const { siteId, featuredImageId } = this.props;
		const classes = classnames( 'editor-featured-image', {
			'is-assigned': !! featuredImageId,
			'has-active-drop-zone': this.props.hasDropZone && this.props.isDropZoneVisible,
		} );

		return (
			<div className={ classes }>
				{ featuredImageId && <QueryMedia siteId={ siteId } mediaId={ featuredImageId } /> }
				{ this.renderMediaModal() }
				<div className="editor-featured-image__inner-content">
					<Button
						className="editor-featured-image__current-image"
						onClick={ this.showMediaModal }
						borderless
						compact
						data-tip-target="editor-featured-image-current-image"
					>
						{ this.renderCurrentImage() }
						<Gridicon icon="pencil" className="editor-featured-image__edit-icon" />
					</Button>
					{ featuredImageId && <RemoveButton onRemove={ this.removeImage } /> }
				</div>

				{ this.props.hasDropZone && <FeaturedImageDropZone /> }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const featuredImageId = getFeaturedImageId( post );

		return {
			siteId,
			postId,
			featuredImageId,
			featuredImage: getMediaItem( state, siteId, featuredImageId ),
			isDropZoneVisible: isDropZoneVisible( state, 'featuredImage' ),
		};
	},
	{
		editPost,
		recordEditorStat,
		recordEditorEvent,
		recordTracksEvent,
	}
)( localize( EditorFeaturedImage ) );
