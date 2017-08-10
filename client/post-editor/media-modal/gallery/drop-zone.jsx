/** @format */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibraryDropZone from 'my-sites/media-library/drop-zone';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryDropZone',

	propTypes: {
		site: PropTypes.object,
		onInvalidItemAdded: PropTypes.func,
	},

	getDefaultProps() {
		return {
			onInvalidItemAdded: () => {},
		};
	},

	filterDroppedImagesSelected() {
		const { site } = this.props;
		if ( ! site ) {
			return;
		}

		const selectedItems = MediaLibrarySelectedStore.getAll( site.ID );
		const filteredItems = MediaUtils.filterItemsByMimePrefix( selectedItems, 'image' );

		if ( ! isEqual( selectedItems, filteredItems ) ) {
			MediaActions.setLibrarySelectedItems( site.ID, filteredItems );
			this.props.onInvalidItemAdded();
		}
	},

	render() {
		return (
			<MediaLibraryDropZone
				site={ this.props.site }
				onAddMedia={ this.filterDroppedImagesSelected }
				fullScreen={ false }
			/>
		);
	},
} );
