/**
 * External dependencies
 */
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaActions from 'lib/media/actions';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaUtils from 'lib/media/utils';
import MediaLibraryDropZone from 'my-sites/media-library/drop-zone';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryDropZone',

	propTypes: {
		site: PropTypes.object,
		onInvalidItemAdded: PropTypes.func
	},

	getDefaultProps() {
		return {
			onInvalidItemAdded: () => {}
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
				fullScreen={ false } />
		);
	}
} );
