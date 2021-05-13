/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { head } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DropZone from 'calypso/components/drop-zone';
import { filterItemsByMimePrefix } from 'calypso/lib/media/utils';
import ImageSelectorDropZoneIcon from './dropzone-icon';

import { addMedia } from 'calypso/state/media/thunks';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import { getSite } from 'calypso/state/sites/selectors';

class ImageSelectorDropZone extends Component {
	static propTypes = {
		onDroppedImage: PropTypes.func,
		addMedia: PropTypes.func,
		site: PropTypes.object,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	onFilesDrop = async ( files ) => {
		/**
		 * Filter files for `image` media prefix and return the first image.
		 *
		 * At the moment we ignore all the other images that were dragged onto the DropZone
		 */
		const droppedImage = head( filterItemsByMimePrefix( files, 'image' ) );

		if ( ! droppedImage ) {
			return false;
		}

		const file = {
			fileContents: droppedImage,
			fileName: droppedImage.name,
		};
		const [ uploadedMedia ] = await this.props.addMedia( file, this.props.site );

		this.props.onDroppedImage( uploadedMedia );
	};

	render() {
		return (
			<DropZone
				className="image-selector__dropzone"
				dropZoneName="imageSelector"
				icon={ <ImageSelectorDropZoneIcon /> }
				textLabel={ this.props.translate( 'Add Image' ) }
				onFilesDrop={ this.onFilesDrop }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { siteId } = ownProps;
		const props = {
			siteId: getSelectedSiteId( state ),
			site: getSelectedSite( state ),
		};
		if ( siteId ) {
			props.siteId = siteId;
			props.site = getSite( state, siteId );
		}
		return props;
	},
	{
		addMedia,
	}
)( localize( ImageSelectorDropZone ) );
