/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { head, partial } from 'lodash';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import PodcastCoverImage from 'blocks/podcast-cover-image';
import { getSelectedSiteId } from 'state/ui/selectors';
import { resetAllImageEditorState } from 'state/ui/editor/image-editor/actions';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';

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

	setCoverImage = ( error, blob ) => {
		if ( error || ! blob ) {
			return;
		}

		const { siteId } = this.props;
		const selectedItem = head( MediaLibrarySelectedStore.getAll( siteId ) );
		if ( ! selectedItem ) {
			return;
		}

		//@TODO Check for edit
		//@TODO If edited, upload new image
		//@TODO Update settings w/ attachment id

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
				<PodcastCoverImage size={ 96 } />
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
		};
	},
	{
		resetAllImageEditorState,
		onEditSelectedMedia: partial( setEditorMediaModalView, ModalViews.IMAGE_EDITOR ),
		onCancelEditingCoverImage: partial( setEditorMediaModalView, ModalViews.LIST ),
	}
)( localize( PodcastCoverImageSetting ) );
