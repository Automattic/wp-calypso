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
import MediaLibrary from 'client/my-sites/media-library';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import Dialog from 'client/components/dialog';
import { EditorMediaModalDetail } from 'client/post-editor/media-modal/detail';
import ImageEditor from 'client/blocks/image-editor';
import VideoEditor from 'client/blocks/video-editor';
import MediaActions from 'client/lib/media/actions';
import MediaUtils from 'client/lib/media/utils';
import MediaLibrarySelectedData from 'client/components/data/media-library-selected-data';
import MediaLibrarySelectedStore from 'client/lib/media/library-selected-store';
import accept from 'client/lib/accept';
import searchUrl from 'client/lib/search-url';

class Media extends Component {
	static propTypes = {
		selectedSite: PropTypes.object,
		filter: PropTypes.string,
		search: PropTypes.string,
		source: PropTypes.string,
	};

	state = {
		currentDetail: null,
		editedImageItem: null,
		editedVideoItem: null,
		selectedItems: [],
		source: '',
	};

	componentDidMount() {
		this.setState( {
			containerWidth: this.refs.container.clientWidth,
		} );
	}

	onFilterChange = filter => {
		let redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.selectedSite ) {
			redirect += '/' + this.props.selectedSite.slug;
		}

		if ( this.props.selectedSite ) {
			MediaActions.setLibrarySelectedItems( this.props.selectedSite.ID, [] );
		}

		page( redirect );
	};

	openDetailsModalForASingleImage = image => {
		this.setState( {
			currentDetail: 0,
			selectedItems: [ image ],
		} );
	};

	openDetailsModalForAllSelected = () => {
		const site = this.props.selectedSite;
		const selected = MediaLibrarySelectedStore.getAll( site.ID );

		this.setState( {
			currentDetail: 0,
			selectedItems: selected,
		} );
	};

	closeDetailsModal = () => {
		this.setState( {
			editedImageItem: null,
			editedVideoItem: null,
			currentDetail: null,
			selectedItems: [],
		} );
	};

	editImage = () => {
		this.setState( { currentDetail: null, editedImageItem: this.state.currentDetail } );
	};

	editVideo = () => {
		this.setState( { currentDetail: null, editedVideoItem: this.state.currentDetail } );
	};

	onImageEditorCancel = imageEditorProps => {
		const { resetAllImageEditorState } = imageEditorProps;
		this.setState( { currentDetail: this.state.editedImageItem, editedImageItem: null } );

		resetAllImageEditorState();
	};

	onImageEditorDone = ( error, blob, imageEditorProps ) => {
		if ( error ) {
			this.onEditImageCancel( imageEditorProps );

			return;
		}

		const { fileName, site, ID, resetAllImageEditorState } = imageEditorProps;

		const mimeType = MediaUtils.getMimeType( fileName );

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
		this.setState( { currentDetail: null, editedImageItem: null, selectedItems: [] } );
	};

	getModalButtons() {
		// do not render buttons if the media image or video editor is opened
		if ( this.state.editedImageItem !== null || this.state.editedVideoItem !== null ) {
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

	onVideoEditorCancel = () => {
		this.setState( { currentDetail: this.state.editedVideoItem, editedVideoItem: null } );
	};

	onVideoEditorUpdatePoster = ( { ID, posterUrl } ) => {
		const site = this.props.selectedSite;

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

		this.setState( { currentDetail: null, editedVideoItem: null, selectedItems: [] } );
	};

	restoreOriginalMedia = ( siteId, item ) => {
		if ( ! siteId || ! item ) {
			return;
		}
		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );
		this.setState( { currentDetail: null, editedImageItem: null, selectedItems: [] } );
	};

	setDetailSelectedIndex = index => {
		this.setState( { currentDetail: index } );
	};

	/**
	 * Start the process to delete media items.
	 * `callback` is an optional parameter which will execute once the confirm dialog is accepted.
	 * It's used especially when the item is attempting to be removed using the item detail dialog.
	 *
	 * @param  {Function} [callback] - callback function
	 */
	deleteMedia( callback ) {
		const { selectedSite, translate } = this.props;
		const selected = MediaLibrarySelectedStore.getAll( selectedSite.ID );
		const selectedCount = selected.length;
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

	handleDeleteMediaEvent = () => {
		this.deleteMedia();
	};

	handleSourceChange = ( source, cb ) => {
		if ( this.props.search ) {
			// Before we change the source reset the search value - it is confusing to jump between sources while searching
			searchUrl( '', this.props.search );
		}

		MediaActions.sourceChanged( this.props.selectedSite.ID );
		this.setState( { source }, cb );
	};

	deleteMediaByItemDetail = () => {
		this.deleteMedia( () => this.closeDetailsModal() );
	};

	confirmDeleteMedia = () => {
		const site = this.props.selectedSite;

		if ( ! site ) {
			return;
		}

		const selected =
			this.state.selectedItems && this.state.selectedItems.length
				? this.state.selectedItems
				: MediaLibrarySelectedStore.getAll( site.ID );

		MediaActions.delete( site.ID, selected );
	};

	render() {
		const site = this.props.selectedSite;
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				{ ( this.state.editedImageItem !== null ||
					this.state.editedVideoItem !== null ||
					this.state.currentDetail !== null ) && (
					<Dialog
						isVisible={ true }
						additionalClassNames="editor-media-modal media__item-dialog"
						buttons={ this.getModalButtons() }
						onClose={ this.closeDetailsModal }
					>
						{ this.state.currentDetail !== null && (
							<EditorMediaModalDetail
								site={ site }
								items={ this.state.selectedItems }
								selectedIndex={ this.state.currentDetail }
								onReturnToList={ this.closeDetailsModal }
								onEditImageItem={ this.editImage }
								onEditVideoItem={ this.editVideo }
								onRestoreItem={ this.restoreOriginalMedia }
								onSelectedIndexChange={ this.setDetailSelectedIndex }
							/>
						) }
						{ this.state.editedImageItem !== null && (
							<ImageEditor
								siteId={ site && site.ID }
								media={ this.state.selectedItems[ this.state.editedImageItem ] }
								onDone={ this.onImageEditorDone }
								onCancel={ this.onImageEditorCancel }
							/>
						) }
						{ this.state.editedVideoItem !== null && (
							<VideoEditor
								media={ this.state.selectedItems[ this.state.editedVideoItem ] }
								onCancel={ this.onVideoEditorCancel }
								onUpdatePoster={ this.onVideoEditorUpdatePoster }
							/>
						) }
					</Dialog>
				) }
				{ site &&
					site.ID && (
						<MediaLibrarySelectedData siteId={ site.ID }>
							<MediaLibrary
								{ ...this.props }
								className="media__main-section"
								onFilterChange={ this.onFilterChange }
								site={ site }
								single={ false }
								filter={ this.props.filter }
								source={ this.state.source }
								onEditItem={ this.openDetailsModalForASingleImage }
								onViewDetails={ this.openDetailsModalForAllSelected }
								onDeleteItem={ this.handleDeleteMediaEvent }
								onSourceChange={ this.handleSourceChange }
								modal={ false }
								containerWidth={ this.state.containerWidth }
							/>
						</MediaLibrarySelectedData>
					) }
			</div>
		);
	}
}

export default localize( Media );
