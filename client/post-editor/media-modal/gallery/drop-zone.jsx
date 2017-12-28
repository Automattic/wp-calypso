/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibraryDropZone from 'client/my-sites/media-library/drop-zone';
import MediaLibrarySelectedStore from 'client/lib/media/library-selected-store';
import MediaActions from 'client/lib/media/actions';
import MediaUtils from 'client/lib/media/utils';

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
		const filteredItems = MediaUtils.filterItemsByMimePrefix( selectedItems, 'image' );

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
