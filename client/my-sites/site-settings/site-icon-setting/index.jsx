/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { uniqueId, head, partial, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import SiteIcon from 'components/site-icon';
import Button from 'components/button';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import AsyncLoad from 'components/async-load';
import Dialog from 'components/dialog';
import { saveSiteSettings } from 'state/site-settings/actions';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { resetAllImageEditorState } from 'state/ui/editor/image-editor/actions';
import { receiveMedia } from 'state/media/actions';
import { isJetpackSite, getCustomizerUrl, getSiteAdminUrl } from 'state/sites/selectors';
import { ModalViews } from 'state/ui/media-modal/constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isEnabled } from 'config';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import InfoPopover from 'components/info-popover';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import { isItemBeingUploaded } from 'lib/media/utils';
import { addQueryArgs } from 'lib/url';
import { getImageEditorCrop } from 'state/ui/editor/image-editor/selectors';

class SiteIconSetting extends Component {
	static propTypes = {
		translate: PropTypes.func,
		siteId: PropTypes.number,
		isJetpack: PropTypes.bool,
		customizerUrl: PropTypes.string,
		generalOptionsUrl: PropTypes.string,
		onEditSelectedMedia: PropTypes.func,
		resetAllImageEditorState: PropTypes.func,
		crop: PropTypes.object
	};

	state = {
		isModalVisible: false,
		hasToggledModal: false
	};

	toggleModal = ( isModalVisible ) => {
		this.setState( {
			isModalVisible,
			hasToggledModal: true
		} );
	};

	hideModal = () => this.toggleModal( false );

	showModal = () => this.toggleModal( true );

	editSelectedMedia = ( value ) => {
		if ( value ) {
			this.props.onEditSelectedMedia();
		} else {
			this.hideModal();
		}
	};

	saveSiteIconSetting( siteId, media ) {
		this.props.receiveMedia( siteId, media );
		this.props.saveSiteSettings( siteId, { site_icon: media.ID } );
	}

	uploadSiteIcon( blob, fileName ) {
		const { siteId } = this.props;

		// Upload media using a manually generated ID so that we can continue
		// to reference it within this function
		const transientMediaId = uniqueId( 'site-icon' );
		MediaActions.add( siteId, {
			ID: transientMediaId,
			fileContents: blob,
			fileName
		} );

		const checkUploadComplete = () => {
			// MediaStore tracks pointers from transient media to the persisted
			// copy, so if our request is for a media which is not transient,
			// we can assume the upload has finished.
			const media = MediaStore.get( siteId, transientMediaId );
			if ( isItemBeingUploaded( media ) ) {
				return;
			}

			MediaStore.off( 'change', checkUploadComplete );
			this.saveSiteIconSetting( siteId, media );
		};

		MediaStore.on( 'change', checkUploadComplete );
	}

	setSiteIcon = ( error, blob ) => {
		if ( error || ! blob ) {
			return;
		}

		const { siteId } = this.props;
		const selectedItem = head( MediaLibrarySelectedStore.getAll( siteId ) );
		if ( ! selectedItem ) {
			return;
		}

		const { crop } = this.props;
		const isImageCropped = ! isEqual( crop, {
			topRatio: 0,
			leftRatio: 0,
			widthRatio: 1,
			heightRatio: 1
		} );

		if ( isImageCropped ) {
			this.uploadSiteIcon( blob, `cropped-${ selectedItem.file }` );
		} else {
			this.saveSiteIconSetting( siteId, selectedItem );
		}

		this.hideModal();
		this.props.resetAllImageEditorState();
	};

	preloadModal() {
		asyncRequire( 'post-editor/media-modal' );
	}

	render() {
		const { translate, siteId, isJetpack, customizerUrl, generalOptionsUrl } = this.props;
		const { isModalVisible, hasToggledModal } = this.state;
		const isIconManagementEnabled = isEnabled( 'manage/site-settings/site-icon' );

		let buttonProps;
		if ( isIconManagementEnabled ) {
			buttonProps = {
				type: 'button',
				onClick: this.showModal,
				onMouseEnter: this.preloadModal
			};
		} else {
			buttonProps = { rel: 'external' };

			if ( isJetpack ) {
				buttonProps.href = addQueryArgs( {
					'autofocus[section]': 'title_tagline'
				}, customizerUrl );
			} else {
				buttonProps.href = generalOptionsUrl;
				buttonProps.target = '_blank';
			}
		}

		return (
			<FormFieldset className="site-icon-setting">
				<FormLabel className="site-icon-setting__heading">
					{ translate( 'Site Icon' ) }
					<InfoPopover position="bottom right">
						{ translate( 'A browser and app icon for your site.' ) }
					</InfoPopover>
				</FormLabel>
				{ React.createElement( buttonProps.href ? 'a' : 'button', {
					...buttonProps,
					className: 'site-icon-setting__icon'
				}, <SiteIcon size={ 96 } siteId={ siteId } /> ) }
				<Button
					{ ...buttonProps }
					className="site-icon-setting__change-button"
					compact>
					{ translate( 'Change', { context: 'verb' } ) }
				</Button>
				{ isIconManagementEnabled && hasToggledModal && (
					<MediaLibrarySelectedData siteId={ siteId }>
						<AsyncLoad
							require="post-editor/media-modal"
							placeholder={ (
								<Dialog
									additionalClassNames="editor-media-modal"
									isVisible={ isModalVisible } />
							) }
							siteId={ siteId }
							onClose={ this.editSelectedMedia }
							enabledFilters={ [ 'images' ] }
							imageEditorProps={ {
								allowedAspectRatios: [ AspectRatios.ASPECT_1X1 ],
								onDone: this.setSiteIcon
							} }
							visible={ isModalVisible }
							labels={ {
								confirm: translate( 'Continue' )
							} }
							single />
					</MediaLibrarySelectedData>
				) }
			</FormFieldset>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			isJetpack: isJetpackSite( state, siteId ),
			customizerUrl: getCustomizerUrl( state, siteId ),
			generalOptionsUrl: getSiteAdminUrl( state, siteId, 'options-general.php' ),
			crop: getImageEditorCrop( state )
		};
	},
	{
		onEditSelectedMedia: partial( setEditorMediaModalView, ModalViews.IMAGE_EDITOR ),
		resetAllImageEditorState,
		saveSiteSettings,
		receiveMedia
	}
)( localize( SiteIconSetting ) );
