/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MediaLibrary from 'my-sites/media-library';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Dialog from 'components/dialog';
import { EditorMediaModalDetail } from 'post-editor/media-modal/detail';
import ImageEditor from 'blocks/image-editor';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import accept from 'lib/accept';

class Media extends Component {

	static propTypes = {
		selectedSite: PropTypes.object,
		filter: PropTypes.string,
		search: PropTypes.string
	};

	state = {
		editedItem: null,
		currentDetail: null,
		selectedImages: [],
	};

	componentDidMount() {
		this.setState( {
			containerWidth: this.refs.container.clientWidth
		} );
	}

	onFilterChange = ( filter ) => {
		let redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.selectedSite ) {
			redirect += '/' + this.props.selectedSite.slug;
		}

		page( redirect );
	};

	openDetailsModalForASingleImage = ( image ) => {
		this.setState( {
			currentDetail: 0,
			selectedImages: [ image ],
		} );
	};

	openDetailsModalForAllSelected = () => {
		const site = this.props.selectedSite;
		const selected = MediaLibrarySelectedStore.getAll( site.ID );

		this.setState( {
			currentDetail: 0,
			selectedImages: selected
		} );
	};

	closeDetailsModal = () => {
		this.setState( { editedItem: null, currentDetail: null, selectedImages: [] } );
	};

	editImage = () => {
		this.setState( { currentDetail: null, editedItem: this.state.currentDetail } );
	};

	onImageEditorCancel = ( imageEditorProps ) => {
		const {	resetAllImageEditorState } = imageEditorProps;
		this.setState( { currentDetail: this.state.editedItem, editedItem: null } );

		resetAllImageEditorState();
	};

	onImageEditorDone = ( error, blob, imageEditorProps ) => {
		if ( error ) {
			this.onEditImageCancel( imageEditorProps );

			return;
		}

		const {
			fileName,
			site,
			ID,
			resetAllImageEditorState
		} = imageEditorProps;

		const mimeType = MediaUtils.getMimeType( fileName );

		const item = {
			ID: ID,
			media: {
				fileName: fileName,
				fileContents: blob,
				mimeType: mimeType
			}
		};

		MediaActions.update( site.ID, item, true );
		resetAllImageEditorState();
		this.setState( { currentDetail: null, editedItem: null, selectedImages: [] } );
	};

	getModalButtons() {
		// do not render buttons if the media image editor is opened
		if ( this.state.editedItem !== null ) {
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
			}
		];
	}

	restoreOriginalMedia = ( siteId, item ) => {
		if ( ! siteId || ! item ) {
			return;
		}
		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );
		this.setState( { currentDetail: null, editedItem: null, selectedImages: [] } );
	};

	setDetailSelectedIndex = ( index ) => {
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
		const site = this.props.selectedSite;
		const selected = MediaLibrarySelectedStore.getAll( site.ID );
		const selectedCount = selected.length;
		const confirmMessage = this.props.translate(
			'Are you sure you want to permanently delete this item?',
			'Are you sure you want to permanently delete these items?',
			{ count: selectedCount }
		);

		accept( confirmMessage, accepted => {
			if ( ! accepted ) {
				return;
			}

			this.confirmDeleteMedia();
			if ( callback ) {
				callback();
			}
		} );
	}

	handleDeleteMediaEvent = () => {
		this.deleteMedia();
	};

	deleteMediaByItemDetail = () => {
		this.deleteMedia( () => this.closeDetailsModal() );
	};

	confirmDeleteMedia = () => {
		const site = this.props.selectedSite;

		if ( ! site ) {
			return;
		}

		const selected = this.state.selectedImages && this.state.selectedImages.length
			? this.state.selectedImages
			: MediaLibrarySelectedStore.getAll( site.ID );

		MediaActions.delete( site.ID, selected );
	};

	render() {
		const site = this.props.selectedSite;
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				{ ( this.state.editedItem !== null || this.state.currentDetail !== null ) &&
					<Dialog
						isVisible={ true }
						additionalClassNames="editor-media-modal media__item-dialog"
						buttons={ this.getModalButtons() }
						onClose={ this.closeDetailsModal }
					>
					{ this.state.currentDetail !== null &&
						<EditorMediaModalDetail
							site={ site }
							items={ this.state.selectedImages }
							selectedIndex={ this.state.currentDetail }
							onReturnToList={ this.closeDetailsModal }
							onEditItem={ this.editImage }
							onRestoreItem={ this.restoreOriginalMedia }
							onSelectedIndexChange={ this.setDetailSelectedIndex }
						/>
					}
					{ this.state.editedItem !== null &&
						<ImageEditor
							siteId={ site && site.ID }
							media={ this.state.selectedImages[ this.state.editedItem ] }
							onDone={ this.onImageEditorDone }
							onCancel={ this.onImageEditorCancel }
						/>
					}
					</Dialog>
				}
				{ site && site.ID && (
					<MediaLibrarySelectedData siteId={ site.ID }>
						<MediaLibrary
							{ ...this.props }
							className="media__main-section"
							onFilterChange={ this.onFilterChange }
							site={ site }
							single={ false }
							filter={ this.props.filter }
							onEditItem={ this.openDetailsModalForASingleImage }
							onViewDetails={ this.openDetailsModalForAllSelected }
							onDeleteItem={ this.handleDeleteMediaEvent }
							modal={ false }
							containerWidth={ this.state.containerWidth } />
					</MediaLibrarySelectedData>
				) }
			</div>
		);
	}
}

export default localize( Media );
