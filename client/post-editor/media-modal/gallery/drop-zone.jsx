/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibraryDropZone from 'my-sites/media-library/drop-zone';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaActions from 'lib/media/actions';
import { filterItemsByMimePrefix } from 'lib/media/utils';

export default class extends React.Component {
	static displayName = 'EditorMediaModalGalleryDropZone';

	static propTypes = {
		site: PropTypes.object,
		onInvalidItemAdded: PropTypes.func,
	};

	static defaultProps = {
		onInvalidItemAdded: () => {},
	};

	filterDroppedImagesSelected = () => {
		const { site } = this.props;
		if ( ! site ) {
			return;
		}

		const selectedItems = MediaLibrarySelectedStore.getAll( site.ID );
		const filteredItems = filterItemsByMimePrefix( selectedItems, 'image' );

		if ( ! isEqual( selectedItems, filteredItems ) ) {
			MediaActions.setLibrarySelectedItems( site.ID, filteredItems );
			this.props.onInvalidItemAdded();
		}
	};

	render() {
		return (
			<MediaLibraryDropZone
				site={ this.props.site }
				onAddMedia={ this.filterDroppedImagesSelected }
				fullScreen={ false }
			/>
		);
	}
}
