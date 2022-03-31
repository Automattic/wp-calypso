import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { filterItemsByMimePrefix } from 'calypso/lib/media/utils';
import MediaLibraryDropZone from 'calypso/my-sites/media-library/drop-zone';
import { withSelectedItems } from 'calypso/my-sites/media/context';

class EditorMediaModalGalleryDropZone extends Component {
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
			this.props.selectMediaItems( site.ID, filteredItems );
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

export default withSelectedItems( EditorMediaModalGalleryDropZone );
