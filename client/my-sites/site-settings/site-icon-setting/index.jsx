/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { head, partial, partialRight, isEqual, flow, compact, includes } from 'lodash';

/**
 * Internal dependencies
 */
import SiteIcon from 'calypso/blocks/site-icon';
import { Button } from '@automattic/components';
import AsyncLoad from 'calypso/components/async-load';
import EditorMediaModalDialog from 'calypso/post-editor/media-modal/dialog';
import accept from 'calypso/lib/accept';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { isSavingSiteSettings } from 'calypso/state/site-settings/selectors';
import { setEditorMediaModalView } from 'calypso/state/editor/actions';
import { resetAllImageEditorState } from 'calypso/state/editor/image-editor/actions';
import { getCustomizerUrl, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { ModalViews } from 'calypso/state/ui/media-modal/constants';
import { AspectRatios } from 'calypso/state/editor/image-editor/constants';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import InfoPopover from 'calypso/components/info-popover';
import {
	getImageEditorCrop,
	getImageEditorTransform,
} from 'calypso/state/editor/image-editor/selectors';
import getSiteIconId from 'calypso/state/selectors/get-site-icon-id';
import getSiteIconUrl from 'calypso/state/selectors/get-site-icon-url';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteSupportingImageEditor from 'calypso/state/selectors/is-site-supporting-image-editor';
import { uploadSiteIcon } from 'calypso/state/media/thunks';

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
		this.props.saveSiteSettings( siteId, { site_icon: media.ID } );
	}

	uploadSiteIcon( blob, fileName ) {
		const { siteId, translate, siteIconId, site } = this.props;
		this.props.uploadSiteIcon( blob, fileName, siteId, translate, siteIconId, site );
	}

	setSiteIcon = ( error, blob ) => {
		if ( error || ! blob ) {
			return;
		}

		const { siteId, selectedItems } = this.props;
		const selectedItem = head( selectedItems );
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
		asyncRequire( 'calypso/post-editor/media-modal' );
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
					{ translate( 'Site icon' ) }
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
					<AsyncLoad
						require="calypso/post-editor/media-modal"
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
						disableLargeImageSources
						single
					/>
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
			selectedItems: getMediaLibrarySelectedItems( state, siteId ),
		};
	},
	{
		recordEvent: ( action ) => recordGoogleEvent( 'Site Settings', action ),
		onEditSelectedMedia: partial( setEditorMediaModalView, ModalViews.IMAGE_EDITOR ),
		onCancelEditingIcon: partial( setEditorMediaModalView, ModalViews.LIST ),
		resetAllImageEditorState,
		saveSiteSettings,
		removeSiteIcon: partialRight( saveSiteSettings, { site_icon: '' } ),
		uploadSiteIcon,
	}
)( localize( SiteIconSetting ) );
