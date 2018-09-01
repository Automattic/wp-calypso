/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import { EditorMediaModalDetail } from 'post-editor/media-modal/detail';
import { getMimePrefix, getMimeType } from 'lib/media/utils';
import ImageEditor from 'blocks/image-editor';
import VideoEditor from 'blocks/video-editor';
import MediaActions from 'lib/media/actions';

import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import accept from 'lib/accept';

class MediaDetails extends Component {
	static propTypes = {
		site: PropTypes.object,
		selected: PropTypes.number,
		items: PropTypes.array,
		view: PropTypes.string,
	};

	closeDetailsModal = () => {
		page( '/media/' + this.props.site.slug + '/' );
		return;
	};

	onEditorCancel = () => {
		page( '/media/' + this.props.site.slug + '/' + this.getSelectedMedia().ID );
		return;
	};

	onImageEditorDone = ( error, blob, imageEditorProps ) => {
		if ( error ) {
			this.onEditImageCancel( imageEditorProps );
			return;
		}

		const { fileName, site, ID, resetAllImageEditorState } = imageEditorProps;

		const mimeType = getMimeType( fileName );

		const item = {
			ID: ID,
			media: {
				fileName: fileName,
				fileContents: blob,
				mimeType: mimeType,
			},
		};

		MediaActions.update( site.ID, item, true );
		resetAllImageEditorState();
		this.closeDetailsModal();
	};

	getModalButtons() {
		// do not render buttons if the media image or video editor is opened
		if ( this.props.view === 'edit' ) {
			return null;
		}

		const { translate } = this.props;

		return [
			{
				action: 'delete',
				additionalClassNames: 'media__modal-delete-item-button is-link',
				label: translate( 'Delete' ),
				isPrimary: false,
				disabled: false,
				onClick: this.deleteMediaByItemDetail,
			},
			{
				action: 'confirm',
				label: translate( 'Done' ),
				isPrimary: true,
				disabled: false,
				onClose: this.closeDetailsModal,
			},
		];
	}

	onVideoEditorUpdatePoster = ( { ID, posterUrl } ) => {
		const site = this.props.site;

		// Photon does not support URLs with a querystring component.
		const urlBeforeQuery = ( posterUrl || '' ).split( '?' )[ 0 ];

		if ( site ) {
			MediaActions.edit( site.ID, {
				ID,
				thumbnails: {
					fmt_hd: urlBeforeQuery,
					fmt_dvd: urlBeforeQuery,
					fmt_std: urlBeforeQuery,
				},
			} );
		}

		this.props.onBack();
	};

	restoreOriginalMedia = ( siteId, item ) => {
		if ( ! siteId || ! item ) {
			return;
		}
		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );
		this.props.onBack();
	};

	setDetailSelectedIndex = index => {
		page( '/media/' + this.props.site.slug + '/' + this.getSelectedMedia( index ).ID );
	};

	/**
	 * Start the process to delete media items.
	 * `callback` is an optional parameter which will execute once the confirm dialog is accepted.
	 * It's used especially when the item is attempting to be removed using the item detail dialog.
	 *
	 * @param  {Function} [callback] - callback function
	 */
	deleteMedia( callback ) {
		const { translate, items } = this.props;
		const selectedCount = items.length;
		const confirmMessage = translate(
			'Are you sure you want to delete this item? ' +
				'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
				'This cannot be undone.',
			'Are you sure you want to delete these items? ' +
				'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
				'This cannot be undone.',
			{ count: selectedCount }
		);

		accept(
			confirmMessage,
			accepted => {
				if ( ! accepted ) {
					return;
				}

				this.confirmDeleteMedia();
				if ( callback ) {
					callback();
				}
			},
			translate( 'Delete' ),
			null,
			{
				isScary: true,
			}
		);
	}

	enableEditMode = () => {
		page( '/media/edit/' + this.props.site.slug + '/' + this.getSelectedMedia().ID );
		return;
	};

	handleDeleteMediaEvent = () => {
		this.deleteMedia();
	};

	deleteMediaByItemDetail = () => {
		this.deleteMedia( () => this.closeDetailsModal() );
	};

	confirmDeleteMedia = () => {
		const site = this.props.site;

		if ( ! site ) {
			return;
		}

		const selected =
			this.props.items && this.props.items.length
				? this.props.items
				: MediaLibrarySelectedStore.getAll( site.ID );

		MediaActions.delete( site.ID, selected );
	};

	getSelectedMedia = ( index = null ) => {
		if ( index === null ) {
			return this.props.items[ this.props.selected ];
		}
		return this.props.items[ index ];
	};

	render() {
		const { site, view, items, selected } = this.props;
		const mimePrefix = getMimePrefix( this.getSelectedMedia() );
		return (
			<Dialog
				isVisible={ true }
				additionalClassNames="editor-media-modal media__item-dialog"
				buttons={ this.getModalButtons() }
				onClose={ this.props.onBack }
			>
				{ view === 'single' && (
					<EditorMediaModalDetail
						site={ site }
						backText="Back"
						items={ items }
						selectedIndex={ selected }
						onReturnToList={ this.props.onBack }
						onEditImageItem={ this.enableEditMode }
						onEditVideoItem={ this.enableEditMode }
						onRestoreItem={ this.restoreOriginalMedia }
						onSelectedIndexChange={ this.setDetailSelectedIndex }
					/>
				) }
				{ view === 'edit' &&
					'video' !== mimePrefix && (
						<ImageEditor
							siteId={ site && site.ID }
							media={ this.getSelectedMedia() }
							onDone={ this.onImageEditorDone }
							onCancel={ this.onEditorCancel }
						/>
					) }
				{ view === 'edit' &&
					'video' === mimePrefix && (
						<VideoEditor
							siteId={ site && site.ID }
							media={ this.getSelectedMedia() }
							onCancel={ this.onEditorCancel }
							onUpdatePoster={ this.onVideoEditorUpdatePoster }
						/>
					) }
			</Dialog>
		);
	}
}

export default localize( MediaDetails );
