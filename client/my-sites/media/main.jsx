/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import MediaLibrary from 'my-sites/media-library';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import observe from 'lib/mixins/data-observe';
import Dialog from 'components/dialog';
import { EditorMediaModalDetail } from 'post-editor/media-modal/detail';
import ImageEditor from 'blocks/image-editor';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import accept from 'lib/accept';

export default React.createClass( {
	displayName: 'Media',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			editedItem: null,
			currentDetail: null,
			selectedImages: [],
		};
	},

	componentDidMount: function() {
		this.setState( {
			containerWidth: this.refs.container.clientWidth
		} );
	},

	onFilterChange: function( filter ) {
		let redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.sites.selected ) {
			redirect += '/' + this.props.sites.selected;
		}

		page( redirect );
	},

	openDetailsModalForASingleImage( image ) {
		this.setState( {
			currentDetail: 0,
			selectedImages: [ image ],
		} );
	},

	openDetailsModalForAllSelected() {
		const site = this.props.sites.getSelectedSite();
		const selected = MediaLibrarySelectedStore.getAll( site.ID );

		this.setState( {
			currentDetail: 0,
			selectedImages: selected
		} );
	},

	closeDetailsModal() {
		this.setState( { editedItem: null, currentDetail: null, selectedImages: [] } );
	},

	editImage() {
		this.setState( { currentDetail: null, editedItem: this.state.currentDetail } );
	},

	onImageEditorCancel: function( imageEditorProps ) {
		const {	resetAllImageEditorState } = imageEditorProps;
		this.setState( { currentDetail: this.state.editedItem, editedItem: null } );

		resetAllImageEditorState();
	},
	onImageEditorDone( error, blob, imageEditorProps ) {
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
	},
	restoreOriginalMedia: function( siteId, item ) {
		if ( ! siteId || ! item ) {
			return;
		}
		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );
		this.setState( { currentDetail: null, editedItem: null, selectedImages: [] } );
	},
	setDetailSelectedIndex: function( index ) {
		this.setState( { currentDetail: index } );
	},
	confirmDeleteMedia: function ( accepted ) {
		const site = this.props.sites.getSelectedSite();
		if ( ! site || ! accepted ) {
			return;
		}
		const selected = MediaLibrarySelectedStore.getAll( site.ID );
		MediaActions.delete( site.ID, selected );
	},

	deleteMedia: function() {
		const site = this.props.sites.getSelectedSite();
		const selected = MediaLibrarySelectedStore.getAll( site.ID );
		const selectedCount = selected.length;
		const confirmMessage = this.translate(
			'Are you sure you want to permanently delete this item?',
			'Are you sure you want to permanently delete these items?',
			{ count: selectedCount }
		);

		accept( confirmMessage, this.confirmDeleteMedia );
	},
	render: function() {
		const site = this.props.sites.getSelectedSite();
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				{ ( this.state.editedItem !== null || this.state.currentDetail !== null) &&
					<Dialog
						isVisible={ true }
						additionalClassNames="editor-media-modal"
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
							onFilterChange={ this.onFilterChange }
							site={ site || false }
							single={ false }
							onEditItem={ this.openDetailsModalForASingleImage }
							onViewDetails={ this.openDetailsModalForAllSelected }
							onDeleteItem={ this.deleteMedia }
							modal={ false }
							containerWidth={ this.state.containerWidth } />
					</MediaLibrarySelectedData>
				) }
			</div>
		);
	}
} );
