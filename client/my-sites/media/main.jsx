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

export default React.createClass( {
	displayName: 'Media',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			editedItem: null,
			openedDetails: null,
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

	openDetailsModal( item ) {
		this.setState( { openedDetails: item } );
	},

	closeDetailsModal() {
		this.setState( { openedDetails: null, editedItem: null } );
	},

	editImage() {
		this.setState( { openedDetails: null, editedItem: this.state.openedDetails } );
	},

	onImageEditorCancel: function( imageEditorProps ) {
		const {	resetAllImageEditorState } = imageEditorProps;
		this.setState( { openedDetails: this.state.editedItem, editedItem: null } );

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
		this.setState( { openedDetails: null, editedItem: null } );
	},

	render: function() {
		const site = this.props.sites.getSelectedSite();
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				{ ( this.state.editedItem || this.state.openedDetails ) &&
					<Dialog
						isVisible={ true }
						additionalClassNames="editor-media-modal"
						onClickOutside={ this.closeDetailsModal }
						onClose={ this.closeDetailsModal }
					>
					{ this.state.openedDetails &&
						<EditorMediaModalDetail
							site={ site }
							items={ [ this.state.openedDetails ] }
							selectedIndex={ 0 }
							onReturnToList={ this.closeDetailsModal }
							onEditItem={ this.editImage }
						/>
					}
					{ this.state.editedItem &&
						<ImageEditor
							siteId={ site && site.ID }
							media={ this.state.editedItem }
							onDone={ this.onImageEditorDone }
							onCancel={ this.onImageEditorCancel }
						/>
					}
					</Dialog>
				}
				<MediaLibrary
					{ ...this.props }
					onFilterChange={ this.onFilterChange }
					site={ site || false }
					single={ true }
					onEditItem={ this.openDetailsModal }
					containerWidth={ this.state.containerWidth } />
			</div>
		);
	}
} );
