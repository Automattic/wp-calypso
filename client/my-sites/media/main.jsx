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

	openDetailsModal() {
		this.setState( { currentDetail: 0 } );
	},

	closeDetailsModal() {
		this.setState( { editedItem: null, currentDetail: null } );
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
		this.setState( { currentDetail: null, editedItem: null } );
	},
	restoreOriginalMedia: function( siteId, item ) {
		if ( ! siteId || ! item ) {
			return;
		}
		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );
		this.setState( { currentDetail: null, editedItem: null } );
	},
	setDetailSelectedIndex: function( index ) {
		this.setState( { currentDetail: index } );
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
							items={ MediaLibrarySelectedStore.getAll( site.ID ) }
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
							media={ MediaLibrarySelectedStore.getAll( site.ID )[ this.state.editedItem ] }
							onDone={ this.onImageEditorDone }
							onCancel={ this.onImageEditorCancel }
						/>
					}
					</Dialog>
				}
				<MediaLibrarySelectedData siteId={ site && site.ID }>
					<MediaLibrary
						{ ...this.props }
						onFilterChange={ this.onFilterChange }
						site={ site || false }
						single={ false }
						onEditItem={ this.openDetailsModal }
						onViewDetails={ this.openDetailsModal }
						onDeleteItem={ () => {} }
						containerWidth={ this.state.containerWidth } />
				</MediaLibrarySelectedData>
			</div>
		);
	}
} );
