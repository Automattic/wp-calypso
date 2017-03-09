/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { head } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import DropZone from 'components/drop-zone';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import PostActions from 'lib/posts/actions';

class FeaturedImageDropZone extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		post: PropTypes.object.isRequired,
	};

	onFilesDrop = ( files ) => {
		/**
		 * Filter files for `image` media prefix and return the first image.
		 *
		 * At the moment we ignore all the other images that were dragged onto the DropZone
		 */
		const droppedImage = head( MediaUtils.filterItemsByMimePrefix( files, 'image' ) );

		if ( ! droppedImage ) {
			return false;
		}

		Dispatcher.register( ( payload ) => {
			const action = payload.action;

			switch ( action.type ) {
				case 'CREATE_MEDIA_ITEM':
					// called when the transient blob has been created and the upload starts
					break;
				case 'RECEIVE_MEDIA_ITEM':
					// called when the media file has been uploaded and needs to be refreshed from the server
					setTimeout( () => {
						PostActions.edit( {
							featured_image: action.data.ID
						} );
					}, 0 );
			}
		} );

		MediaActions.clearValidationErrors( this.props.site.ID );
		MediaActions.add( this.props.site.ID, [ droppedImage ] );
	};

	render() {
		return (
			<DropZone onFilesDrop={ this.onFilesDrop } />
		);
	}
}

export default FeaturedImageDropZone;
