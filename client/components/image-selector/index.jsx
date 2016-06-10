/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import EditorMediaModal from 'post-editor/media-modal';
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import EditorFeaturedImagePreviewContainer from './preview-container';

const ImageSelector = React.createClass( {
	propTypes: {
		site: React.PropTypes.object.isRequired,
		imagePostId: React.PropTypes.number,
		onRemove: React.PropTypes.func.isRequired,
		onSave: React.PropTypes.func.isRequired,
		label: React.PropTypes.string.isRequired,
	},

	getInitialState() {
		return {
			isShowingMedia: false,
		};
	},

	openMediaModal() {
		this.setState( { isShowingMedia: true } );
	},

	closeMediaModal() {
		this.setState( { isShowingMedia: false } );
	},

	onClose( items ) {
		this.props.onSave( items );
		this.setState( { isShowingMedia: false } );
	},

	renderCurrentImage: function() {
		if ( ! this.props.site || ! this.props.imagePostId ) {
			return;
		}

		return (
			<EditorFeaturedImagePreviewContainer
				siteId={ this.props.site.ID }
				itemId={ this.props.imagePostId } />
		);
	},

	renderMediaModal() {
		return (
			<MediaLibrarySelectedData siteId={ this.props.site.ID }>
				<EditorMediaModal
					visible={ this.state.isShowingMedia }
					onClose={ this.onClose }
					site={ this.props.site }
					labels={ { confirm: this.props.label } }
					enabledFilters={ [ 'images' ] }
					single />
			</MediaLibrarySelectedData>
		);
	},

	render() {
		return (
			<div className="image-selector">
				{ this.renderMediaModal() }
				<EditorDrawerWell
					onClick={ this.openMediaModal }
					onRemove={ this.props.onRemove }
					empty={ ! this.props.imagePostId }
					icon="image"
					label={ this.props.label }>
					{ this.renderCurrentImage() }
				</EditorDrawerWell>
			</div>
		);
	}
} );

export default ImageSelector;
