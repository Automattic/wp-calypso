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
import ImageSelectorPreview from './preview';
import ImageSelectorDropZone from './dropzone';
import isDropZoneVisible from 'state/selectors/is-drop-zone-visible';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaActions from 'lib/media/actions';
import MediaModal from 'post-editor/media-modal';
import MediaStore from 'lib/media/store';
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class ImageSelector extends Component {
	static propTypes = {
		className: PropTypes.string,
		compact: PropTypes.bool,
		imageIds: PropTypes.array.isRequired,
		isDropZoneVisible: PropTypes.bool,
		maxWidth: PropTypes.number,
		onAddImage: PropTypes.func,
		onImageChange: PropTypes.func.isRequired,
		onImageSelected: PropTypes.func.isRequired,
		onRemoveImage: PropTypes.func.isRequired,
		previewClassName: PropTypes.string,
		selecting: PropTypes.bool,
		showEditIcon: PropTypes.bool,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	static defaultProps = {
		compact: false,
		isDropZoneVisible: false,
		maxWidth: 450,
		onAddImage: noop,
	};

	state = {
		isSelecting: false,
	};

	showMediaModal = () => {
		const { siteId, imageIds } = this.props;

		if ( imageIds ) {
			const images = imageIds.map( ( imageId ) => MediaStore.get( siteId, imageId ) );
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

	setImage = ( value ) => {
		if ( value ) {
			this.props.onImageSelected( value );
		}
		this.hideMediaModal();
	};

	removeImage = ( image ) => {
		this.props.onRemoveImage( image );
	};

	addImage = ( image ) => {
		this.props.onAddImage( image );
	};

	// called when media library item transitions from temporary ID to a permanent ID, e.g.,
	// after creating an item by uploading or selecting from Google library.
	onImageChange = ( images ) => {
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
					{ ...( ! multiple && { single: true } ) }
				/>
			</MediaLibrarySelectedData>
		);
	}

	renderSelectedImages() {
		const {
			compact,
			previewClassName,
			siteId,
			imageIds,
			maxWidth,
			multiple,
			showEditIcon,
		} = this.props;

		return (
			<ImageSelectorPreview
				className={ previewClassName }
				compact={ compact }
				itemIds={ imageIds }
				maxWidth={ maxWidth }
				multiple={ multiple }
				onImageChange={ this.onImageChange }
				onImageClick={ this.showMediaModal }
				onRemoveImage={ this.removeImage }
				showEditIcon={ showEditIcon }
				siteId={ siteId }
			/>
		);
	}

	render() {
		const { className, imageIds, isImageSelectorDropZoneVisible, siteId } = this.props;
		const classes = classnames( 'image-selector', className, {
			'is-assigned': !! imageIds && imageIds.length,
			'has-active-drop-zone': isImageSelectorDropZoneVisible,
		} );

		return (
			<div className={ classes }>
				{ this.renderMediaModal() }
				<div className="image-selector__inner-content">{ this.renderSelectedImages() }</div>
				<ImageSelectorDropZone onDroppedImage={ this.addImage } siteId={ siteId } />
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { siteId } = ownProps;
	const props = {
		siteId: getSelectedSiteId( state ),
		isImageSelectorDropZoneVisible: isDropZoneVisible( state, 'imageSelector' ),
	};

	if ( siteId ) {
		props.siteId = siteId;
	}
	return props;
} )( localize( ImageSelector ) );
