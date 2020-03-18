/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import getMediaLibrarySelectedItems from 'state/selectors/get-media-library-selected-items';
import MediaLibraryDropZone from 'my-sites/media-library/drop-zone';
import MediaActions from 'lib/media/actions';
import { filterItemsByMimePrefix } from 'lib/media/utils';

class EditorMediaModalGalleryDropZone extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		onInvalidItemAdded: PropTypes.func,
	};

	static defaultProps = {
		onInvalidItemAdded: () => {},
	};

	filterDroppedImagesSelected = () => {
		const { selectedItems, site } = this.props;
		if ( ! site ) {
			return;
		}

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

export default connect( ( state, { site } ) => ( {
	selectedItems: getMediaLibrarySelectedItems( state, site?.ID ),
} ) )( EditorMediaModalGalleryDropZone );
