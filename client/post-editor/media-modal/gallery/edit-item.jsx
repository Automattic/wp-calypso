/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { userCan } from 'lib/site/utils';
import MediaLibraryListItem from 'my-sites/media-library/list-item';
import EditorMediaModalGalleryCaption from './caption';
import EditorMediaModalGalleryRemoveButton from './remove-button';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryEditItem',

	propTypes: {
		site: PropTypes.object,
		item: PropTypes.object
	},

	renderCaption() {
		const { site, item } = this.props;
		if ( ! userCan( 'upload_files', site ) ) {
			return;
		}

		return (
			<EditorMediaModalGalleryCaption
				siteId={ site.ID }
				item={ item } />
		);
	},

	render() {
		const { site, item } = this.props;

		return (
			<div className="editor-media-modal-gallery__edit-item">
				<MediaLibraryListItem
					media={ item }
					scale={ 1 }
					photon={ false } />
				{ this.renderCaption() }
				<EditorMediaModalGalleryRemoveButton
					siteId={ site.ID }
					itemId={ item.ID } />
			</div>
		);
	}
} );
