/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { head, partial, partialRight, isEqual, flow, compact, includes, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';
import { Button } from '@automattic/components';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import AsyncLoad from 'components/async-load';
import EditorMediaModalDialog from 'post-editor/media-modal/dialog';
import accept from 'lib/accept';
import { recordGoogleEvent } from 'state/analytics/actions';
import { saveSiteSettings, updateSiteSettings } from 'state/site-settings/actions';
import { isSavingSiteSettings } from 'state/site-settings/selectors';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { resetAllImageEditorState } from 'state/ui/editor/image-editor/actions';
import { receiveMedia, deleteMedia } from 'state/media/actions';
import { getCustomizerUrl, getSiteAdminUrl, isJetpackSite } from 'state/sites/selectors';
import { ModalViews } from 'state/ui/media-modal/constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import InfoPopover from 'components/info-popover';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import { isItemBeingUploaded } from 'lib/media/utils';
import {
	getImageEditorCrop,
	getImageEditorTransform,
} from 'state/ui/editor/image-editor/selectors';
import getSiteIconId from 'state/selectors/get-site-icon-id';
import getSiteIconUrl from 'state/selectors/get-site-icon-url';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteSupportingImageEditor from 'state/selectors/is-site-supporting-image-editor';
import { errorNotice } from 'state/notices/actions';

/**
 * Style dependencies
 */
import './style.scss';

class SiteIconSetting extends Component {
	static propTypes = {
		translate: PropTypes.func,
		siteId: PropTypes.number,
		isJetpack: PropTypes.bool,
		isPrivate: PropTypes.bool,
		hasIcon: PropTypes.bool,
		iconUrl: PropTypes.string,
		isSaving: PropTypes.bool,
		siteSupportsImageEditor: PropTypes.bool,
		customizerUrl: PropTypes.string,
		generalOptionsUrl: PropTypes.string,
		onEditSelectedMedia: PropTypes.func,
		onCancelEditingIcon: PropTypes.func,
		resetAllImageEditorState: PropTypes.func,
		crop: PropTypes.object,
	};

	state = {
		isModalVisible: false,
		hasToggledModal: false,
		isEditingSiteIcon: false,
	};

	toggleModal = ( isModalVisible ) => {
		const { isEditingSiteIcon } = this.state;

		this.setState( {
			isModalVisible,
			hasToggledModal: true,
			isEditingSiteIcon: isModalVisible ? isEditingSiteIcon : false,
		} );
	};

	hideModal = () => this.toggleModal( false );

	showModal = () => this.toggleModal( true );

	editSelectedMedia = ( value ) => {
		if ( value ) {
			this.setState( { isEditingSiteIcon: true } );
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
		const { siteId, translate, siteIconId, site } = this.props;

		// Upload media using a manually generated ID so that we can continue
		// to reference it within this function
		const transientMediaId = uniqueId( 'site-icon' );

		// Set into state without yet saving to show upload progress indicator
		this.props.updateSiteIcon( siteId, transientMediaId );

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

			if ( isFailedUpload ) {
				this.props.errorNotice( translate( 'An error occurred while uploading the file.' ) );

				// Revert back to previously assigned site icon
				if ( siteIconId ) {
					this.props.updateSiteIcon( siteId, siteIconId );

					// If previous icon object is already available in legacy
					// store, receive into state. Otherwise assume SiteIcon
					// component will trigger request.
					//
					// TODO: Remove when media listing Redux-ified
					const previousIcon = MediaStore.get( siteId, siteIconId );
					if ( previousIcon ) {
						this.props.receiveMedia( siteId, previousIcon );
					}
				}
			} else {
				this.saveSiteIconSetting( siteId, media );
			}
		};

		MediaStore.on( 'change', checkUploadComplete );

		MediaActions.add( site, {
			ID: transientMediaId,
			fileContents: blob,
			fileName,
		} );
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

		const { crop, transform, recordEvent } = this.props;
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

		recordEvent( 'Completed Site Icon Selection' );

		if ( isImageEdited ) {
			this.uploadSiteIcon( blob, `cropped-${ selectedItem.file }` );
		} else {
			this.saveSiteIconSetting( siteId, selectedItem );
		}

		this.hideModal();
		this.props.resetAllImageEditorState();
	};

	confirmRemoval = () => {
		const { translate, siteId, removeSiteIcon, recordEvent } = this.props;
		const message = translate( 'Are you sure you want to remove the site icon?' );

		recordEvent( 'Clicked Remove Site Icon' );

		accept( message, ( accepted ) => {
			if ( accepted ) {
				removeSiteIcon( siteId );
				recordEvent( 'Confirmed Remove Site Icon' );
			}
		} );
	};

	cancelEditingSiteIcon = () => {
		this.props.onCancelEditingIcon();
		this.props.resetAllImageEditorState();
		this.setState( { isEditingSiteIcon: false } );
	};

	preloadModal() {
		asyncRequire( 'post-editor/media-modal' );
	}

	isParentReady( selectedMedia ) {
		return ! selectedMedia.some( ( item ) => item.external );
	}

	render() {
		const {
			isJetpack,
			isPrivate,
			iconUrl,
			customizerUrl,
			generalOptionsUrl,
			siteSupportsImageEditor,
		} = this.props;
		const { isModalVisible, hasToggledModal, isEditingSiteIcon } = this.state;

		let buttonProps;
		if ( siteSupportsImageEditor ) {
			buttonProps = {
				type: 'button',
				onClick: this.showModal,
				onMouseEnter: this.preloadModal,
			};
		} else {
			buttonProps = { rel: 'external' };

			// In case where site is private but still has Blavatar assigned,
			// send to wp-admin instead (Customizer field unsupported)
			const hasBlavatar = includes( iconUrl, '.gravatar.com/blavatar/' );

			if ( isJetpack || ( isPrivate && ! hasBlavatar ) ) {
				buttonProps.href = customizerUrl;
			} else {
				buttonProps.href = generalOptionsUrl;
				buttonProps.target = '_blank';
			}
		}

		// Merge analytics click handler into existing button props
		buttonProps.onClick = flow(
			compact( [ () => this.props.recordEvent( 'Clicked Change Site Icon' ), buttonProps.onClick ] )
		);

		const { translate, siteId, isSaving, hasIcon } = this.props;

		return (
			<FormFieldset className="site-icon-setting">
				<FormLabel className="site-icon-setting__heading">
					{ translate( 'Site Icon' ) }
					<InfoPopover position="bottom right">
						{ translate(
							'The Site Icon is used as a browser and app icon for your site.' +
								' Icons must be square, and at least %s pixels wide and tall.',
							{ args: [ 512 ] }
						) }
					</InfoPopover>
				</FormLabel>
				{ React.createElement(
					buttonProps.href ? 'a' : 'button',
					{
						...buttonProps,
						className: 'site-icon-setting__icon',
					},
					<SiteIcon size={ 96 } siteId={ siteId } />
				) }
				<Button
					{ ...buttonProps }
					className="site-icon-setting__button"
					data-tip-target="settings-site-icon-change"
					disabled={ isSaving }
					compact
				>
					{ translate( 'Change', { context: 'verb' } ) }
				</Button>
				{ hasIcon && (
					<Button
						compact
						scary
						onClick={ this.confirmRemoval }
						className="site-icon-setting__button"
						disabled={ isSaving }
					>
						{ translate( 'Remove' ) }
					</Button>
				) }
				{ hasToggledModal && (
					<MediaLibrarySelectedData siteId={ siteId }>
						<AsyncLoad
							require="post-editor/media-modal"
							placeholder={ <EditorMediaModalDialog isVisible /> }
							siteId={ siteId }
							onClose={ this.editSelectedMedia }
							isParentReady={ this.isParentReady }
							enabledFilters={ [ 'images' ] }
							{ ...( isEditingSiteIcon
								? {
										imageEditorProps: {
											allowedAspectRatios: [ AspectRatios.ASPECT_1X1 ],
											onDone: this.setSiteIcon,
											onCancel: this.cancelEditingSiteIcon,
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
			isPrivate: isPrivateSite( state, siteId ),
			siteIconId: getSiteIconId( state, siteId ),
			hasIcon: !! getSiteIconUrl( state, siteId ),
			iconUrl: getSiteIconUrl( state, siteId ),
			isSaving: isSavingSiteSettings( state, siteId ),
			siteSupportsImageEditor: isSiteSupportingImageEditor( state, siteId ),
			customizerUrl: getCustomizerUrl( state, siteId, 'identity' ),
			generalOptionsUrl: getSiteAdminUrl( state, siteId, 'options-general.php' ),
			crop: getImageEditorCrop( state ),
			transform: getImageEditorTransform( state ),
			site: getSelectedSite( state ),
		};
	},
	{
		recordEvent: ( action ) => recordGoogleEvent( 'Site Settings', action ),
		onEditSelectedMedia: partial( setEditorMediaModalView, ModalViews.IMAGE_EDITOR ),
		onCancelEditingIcon: partial( setEditorMediaModalView, ModalViews.LIST ),
		resetAllImageEditorState,
		saveSiteSettings,
		updateSiteIcon: ( siteId, mediaId ) => updateSiteSettings( siteId, { site_icon: mediaId } ),
		removeSiteIcon: partialRight( saveSiteSettings, { site_icon: '' } ),
		receiveMedia,
		deleteMedia,
		errorNotice,
	}
)( localize( SiteIconSetting ) );
