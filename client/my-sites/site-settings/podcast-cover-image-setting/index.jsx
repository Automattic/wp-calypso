/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { head, isEqual, partial, uniqueId } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import Image from 'components/image';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaStore from 'lib/media/store';
import { isItemBeingUploaded } from 'lib/media/utils';
import MediaActions from 'lib/media/actions';
import { receiveMedia, deleteMedia } from 'state/media/actions';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { resetAllImageEditorState } from 'state/ui/editor/image-editor/actions';
import {
	getImageEditorCrop,
	getImageEditorTransform,
} from 'state/ui/editor/image-editor/selectors';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';
import resizeImageUrl from 'lib/resize-image-url';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import Spinner from 'components/spinner';

/**
 * Debug
 */
import debugModule from 'debug';
const debug = debugModule( 'calypso:podcast-image' );

class PodcastCoverImageSetting extends PureComponent {
	static propTypes = {
		coverImageId: PropTypes.number,
		coverImageUrl: PropTypes.string,
		onRemove: PropTypes.func,
		onSelect: PropTypes.func,
	};

	state = {
		hasToggledModal: false,
		isEditingCoverImage: false,
		isModalVisible: false,
		transientMediaId: null,
	};

	toggleModal = isModalVisible => {
		const { isEditingCoverImage } = this.state;

		this.setState( {
			isModalVisible,
			hasToggledModal: true,
			isEditingCoverImage: isModalVisible ? isEditingCoverImage : false,
		} );
	};

	showModal = () => this.toggleModal( true );

	hideModal = () => this.toggleModal( false );

	editSelectedMedia = value => {
		if ( value ) {
			this.setState( { isEditingCoverImage: true } );
			this.props.onEditSelectedMedia();
		} else {
			this.hideModal();
		}
	};

	uploadCoverImage( blob, fileName ) {
		const { siteId, site } = this.props;

		// Upload media using a manually generated ID so that we can continue
		// to reference it within this function
		const transientMediaId = uniqueId( 'podcast-cover-image' );

		this.setState( { transientMediaId } );

		const checkUploadComplete = () => {
			// MediaStore tracks pointers from transient media to the persisted
			// copy, so if our request is for a media which is not transient,
			// we can assume the upload has finished.
			const media = MediaStore.get( siteId, transientMediaId );
			const isUploadInProgress = media && isItemBeingUploaded( media );
			const isFailedUpload = ! media;

			if ( isFailedUpload ) {
				this.props.deleteMedia( siteId, transientMediaId );
			} else {
				this.props.receiveMedia( siteId, media );
			}

			if ( isUploadInProgress ) {
				return;
			}

			MediaStore.off( 'change', checkUploadComplete );

			if ( ! isFailedUpload ) {
				debug( 'upload media', media );
				this.props.onSelect( media.ID, media.URL );
			}

			// Remove transient image so that new image shows or if failed upload, the prior image
			this.setState( { transientMediaId: null } );
		};

		MediaStore.on( 'change', checkUploadComplete );

		MediaActions.add( site, {
			ID: transientMediaId,
			fileContents: blob,
			fileName,
		} );
	}

	setCoverImage = ( error, blob ) => {
		if ( error || ! blob ) {
			return;
		}

		const { siteId } = this.props;
		const selectedItem = head( MediaLibrarySelectedStore.getAll( siteId ) );
		if ( ! selectedItem ) {
			return;
		}

		debug( 'selectedItem', selectedItem );

		const { crop, transform } = this.props;
		const isImageEdited = ! isEqual(
			{
				...crop,
				...transform,
			},
			{
				topRatio: 0,
				leftRatio: 0,
				widthRatio: 1,
				heightRatio: 1,
				degrees: 0,
				scaleX: 1,
				scaleY: 1,
			}
		);
		debug( 'isImageEdited', isImageEdited, { crop, transform } );

		if ( isImageEdited ) {
			this.uploadCoverImage( blob, `cropped-${ selectedItem.file }` );
		} else {
			this.props.onSelect( selectedItem.ID, selectedItem.URL );
		}

		this.hideModal();
		this.props.resetAllImageEditorState();
	};

	cancelEditingCoverImage = () => {
		this.props.onCancelEditingCoverImage();
		this.props.resetAllImageEditorState();
		this.setState( { isEditingCoverImage: false } );
	};

	isParentReady( selectedMedia ) {
		return ! selectedMedia.some( item => item.external );
	}

	preloadModal() {
		asyncRequire( 'post-editor/media-modal' );
	}

	renderChangeButton() {
		const { coverImageId, coverImageUrl, translate } = this.props;
		const isCoverSet = coverImageId || coverImageUrl;

		return (
			<Button
				className="podcast-cover-image-setting__button"
				compact
				onClick={ this.showModal }
				onMouseEnter={ this.preloadModal }
			>
				{ isCoverSet ? translate( 'Change' ) : translate( 'Add' ) }
			</Button>
		);
	}

	renderCoverPreview() {
		const { coverImageUrl, siteId, translate } = this.props;
		const { transientMediaId } = this.state;
		const media = transientMediaId && MediaStore.get( siteId, transientMediaId );
		const imageUrl = ( media && media.URL ) || coverImageUrl;
		const imageSrc = imageUrl && resizeImageUrl( imageUrl, 96 );
		const isTransient = !! transientMediaId;

		const classNames = classnames( 'podcast-cover-image-setting__preview', {
			'is-blank': ! imageSrc,
			'is-transient': isTransient,
		} );

		return (
			<button
				className={ classNames }
				onClick={ this.showModal }
				onMouseEnter={ this.preloadModal }
				type="button" // default is "submit" which saves settings on click
			>
				{ imageSrc ? (
					<Image className="podcast-cover-image-setting__img" src={ imageSrc } alt="" />
				) : (
					<span className="podcast-cover-image-setting__placeholder">
						{ translate( 'No image set' ) }
					</span>
				) }
				{ isTransient && <Spinner /> }
			</button>
		);
	}

	renderMediaModal() {
		const { hasToggledModal, isEditingCoverImage, isModalVisible } = this.state;
		const { siteId, translate } = this.props;

		return (
			hasToggledModal && (
				<MediaLibrarySelectedData siteId={ siteId }>
					<AsyncLoad
						require="post-editor/media-modal"
						placeholder={
							<Dialog additionalClassNames="editor-media-modal" isVisible={ isModalVisible } />
						}
						siteId={ siteId }
						onClose={ this.editSelectedMedia }
						isParentReady={ this.isParentReady }
						enabledFilters={ [ 'images' ] }
						{ ...( isEditingCoverImage
							? {
									imageEditorProps: {
										allowedAspectRatios: [ AspectRatios.ASPECT_1X1 ],
										onDone: this.setCoverImage,
										onCancel: this.cancelEditingCoverImage,
									},
							  }
							: {} ) }
						visible={ isModalVisible }
						labels={ {
							confirm: translate( 'Continue' ),
						} }
						disableLargeImageSources={ true }
						single
					/>
				</MediaLibrarySelectedData>
			)
		);
	}

	renderRemoveButton() {
		const { coverImageId, coverImageUrl, onRemove, translate } = this.props;
		const isCoverSet = coverImageId || coverImageUrl;

		return (
			isCoverSet && (
				<Button className="podcast-cover-image-setting__button" compact onClick={ onRemove } scary>
					{ translate( 'Remove' ) }
				</Button>
			)
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<FormFieldset className="podcast-cover-image-setting">
				<FormLabel>{ translate( 'Cover Image' ) }</FormLabel>
				{ this.renderCoverPreview() }
				{ this.renderChangeButton() }
				{ this.renderRemoveButton() }
				{ this.renderMediaModal() }
			</FormFieldset>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			site: getSelectedSite( state ),
			crop: getImageEditorCrop( state ),
			transform: getImageEditorTransform( state ),
		};
	},
	{
		resetAllImageEditorState,
		onEditSelectedMedia: partial( setEditorMediaModalView, ModalViews.IMAGE_EDITOR ),
		onCancelEditingCoverImage: partial( setEditorMediaModalView, ModalViews.LIST ),
		receiveMedia,
		deleteMedia,
	}
)( localize( PodcastCoverImageSetting ) );
