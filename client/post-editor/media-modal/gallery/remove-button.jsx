/**
 * External dependencies
 */
import React, { PropTypes } from 'react/addons';
import reject from 'lodash/collection/reject';

/**
 * Internal dependencies
 */
import MediaActions from 'lib/media/actions';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryRemoveButton',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		siteId: PropTypes.number,
		itemId: PropTypes.number
	},

	remove() {
		const { siteId, itemId } = this.props;
		if ( ! siteId || ! itemId ) {
			return;
		}

		const selected = MediaLibrarySelectedStore.getAll( siteId );
		const items = reject( selected, ( item ) => item.ID === itemId );

		MediaActions.setLibrarySelectedItems( siteId, items );
	},

	render() {
		return (
			<button
				onClick={ this.remove }
				onMouseDown={ ( event ) => event.stopPropagation() }
				className="editor-media-modal-gallery__remove">
				<span className="screen-reader-text">{ this.translate( 'Remove' ) }</span>
				<Gridicon icon="cross" />
			</button>
		);
	}
} );
