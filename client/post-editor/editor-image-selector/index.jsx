/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import EditorImageSelectorPreview from './preview';
import ImageSelectorDropZone from './dropzone';
import isDropZoneVisible from 'state/selectors/is-drop-zone-visible';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaActions from 'lib/media/actions';
import MediaModal from 'post-editor/media-modal';
import MediaStore from 'lib/media/store';
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';

export class EditorImageSelector extends Component {
	static propTypes = {
		hasDropZone: PropTypes.bool,
		imageIds: PropTypes.array,
		isDropZoneVisible: PropTypes.bool,
		showEditIcon: PropTypes.bool,
		maxWidth: PropTypes.number,
		selecting: PropTypes.bool,
		translate: PropTypes.func,
		onImageChange: PropTypes.func,
		onImageSelected: PropTypes.func,
		onRemoveImage: PropTypes.func,
	};

	static defaultProps = {
		imageIds: [],
		hasDropZone: false,
		isDropZoneVisible: false,
		maxWidth: 450,
		onImageSelected: noop,
		onImageChange: noop,
		onRemoveImage: noop,
	};

	state = {
		isSelecting: false,
	};

	showMediaModal = () => {
		const { siteId, imageIds } = this.props;

		if ( imageIds ) {
			const images = imageIds.map( imageId => MediaStore.get( siteId, imageId ) );
			MediaActions.setLibrarySelectedItems( siteId, images );
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

	setImage = value => {
		if ( value ) {
			this.props.onImageSelected( value );
		}
		this.hideMediaModal();
	};

	removeImage = image => {
		this.props.onRemoveImage( image );
	};

	addImage = image => {
		this.props.onAddImage( image );
	};

	// called when media library item transitions from temporary ID to a permanent ID, e.g.,
	// after creating an item by uploading or selecting from Google library.
	onImageChange = images => {
		this.props.onImageChange( images );
	};

	renderMediaModal() {
		if ( ! this.props.siteId ) {
			return;
		}

		const { multiple, selecting, siteId, translate } = this.props;
		const { isSelecting } = this.state;

		return (
			<MediaLibrarySelectedData siteId={ siteId }>
				<MediaModal
					visible={ selecting || isSelecting }
					onClose={ this.setImage }
					siteId={ siteId }
					labels={ { confirm: multiple ? translate( 'Set images' ) : translate( 'Set image' ) } }
					enabledFilters={ [ 'images' ] }
					galleryViewEnabled={ false }
					{ ...! multiple && { single: true } }
				/>
			</MediaLibrarySelectedData>
		);
	}

	renderSelectedImages() {
		const { siteId, imageIds, maxWidth, multiple, showEditIcon } = this.props;

		return (
			<EditorImageSelectorPreview
				siteId={ siteId }
				itemIds={ imageIds }
				maxWidth={ maxWidth }
				onImageChange={ this.onImageChange }
				onImageClick={ this.showMediaModal }
				onRemoveImage={ this.removeImage }
				multiple={ multiple }
				compact={ imageIds && imageIds.length > 0 }
				showEditIcon={ showEditIcon }
			/>
		);
	}

	render() {
		const { imageIds } = this.props;
		const classes = classnames( 'editor-image-selector', {
			'is-assigned': !! imageIds,
			'has-active-drop-zone': this.props.hasDropZone && this.props.isDropZoneVisible,
		} );

		return (
			<div className={ classes }>
				{ this.renderMediaModal() }
				<div className="editor-image-selector__inner-content">{ this.renderSelectedImages() }</div>

				{ this.props.hasDropZone && <ImageSelectorDropZone onDroppedImage={ this.addImage } /> }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		isDropZoneVisible: isDropZoneVisible( state, 'imageSelector' ),
	};
} )( localize( EditorImageSelector ) );
