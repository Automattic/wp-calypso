/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

import AsyncLoad from 'calypso/components/async-load';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EditorFeaturedImagePreviewContainer from 'calypso/post-editor/editor-featured-image/preview-container';
import RemoveButton from 'calypso/components/remove-button';
import { requestMediaItem, setMediaLibrarySelectedItems } from 'calypso/state/media/actions';

class ProductImagePicker extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	state = {
		isSelecting: false,
	};

	showMediaModal = ( event ) => {
		if ( event.key && event.key !== 'Enter' ) {
			// A11y - prevent opening Media modal with any key
			return;
		}

		this.setState( { isSelecting: true } );
	};

	setImage = ( value ) => {
		this.setState( { isSelecting: false }, () => {
			if ( ! value ) {
				return;
			}

			this.props.input.onChange( value.items[ 0 ].ID );

			// In case of image editing, request this media item again in order to
			// update the image in product list and existing payment buttons in editor.
			// This is required to fetch the new URL of edited image.
			this.props.requestMediaItem( this.props.siteId, value.items[ 0 ].ID );
		} );
	};

	removeCurrentImage = ( event ) => {
		event.stopPropagation();

		this.props.input.onChange( false );
	};

	onImageChange = ( imageId ) => {
		this.props.input.onChange( imageId );
		// the action cares only about the ID -- that allows us to construct a 'valid' item
		this.props.setMediaLibrarySelectedItems( this.props.siteId, [ { ID: imageId } ] );
	};

	getImagePlaceholder() {
		return (
			<div
				className="dialog__product-image-placeholder"
				onClick={ this.showMediaModal }
				onKeyDown={ this.showMediaModal }
				role="button"
				tabIndex={ 0 }
			>
				<Gridicon icon="add-image" size={ 36 } />
				{ this.props.translate( 'Add an Image' ) }
			</div>
		);
	}

	getCurrentImage() {
		const { siteId } = this.props;

		return (
			<div
				className="dialog__product-image"
				onClick={ this.showMediaModal }
				onKeyDown={ this.showMediaModal }
				role="button"
				tabIndex={ 0 }
			>
				<EditorFeaturedImagePreviewContainer
					siteId={ siteId }
					itemId={ this.props.input.value }
					onImageChange={ this.onImageChange }
					showEditIcon
				/>
				<RemoveButton onRemove={ this.removeCurrentImage } />
			</div>
		);
	}

	render() {
		const { siteId, translate, makeDirtyAfterImageEdit } = this.props;
		const { isSelecting } = this.state;

		if ( ! siteId ) {
			return;
		}

		return (
			<div className="dialog__product-image-picker">
				<AsyncLoad
					require="calypso/post-editor/media-modal"
					siteId={ siteId }
					onClose={ this.setImage }
					enabledFilters={ [ 'images' ] }
					visible={ isSelecting }
					isBackdropVisible={ false }
					labels={ {
						confirm: translate( 'Add' ),
					} }
					single
					imageEditorProps={ { doneButtonText: translate( 'Update Payment Button' ) } }
					onImageEditorDoneHook={ makeDirtyAfterImageEdit }
					onRestoreMediaHook={ makeDirtyAfterImageEdit }
				/>

				<div className="dialog__product-image-container">
					{ this.props.input.value && this.getCurrentImage() }
					{ ! this.props.input.value && this.getImagePlaceholder() }
				</div>
			</div>
		);
	}
}

export default connect( ( state ) => ( { siteId: getSelectedSiteId( state ) } ), {
	requestMediaItem,
	setMediaLibrarySelectedItems,
} )( localize( ProductImagePicker ) );
