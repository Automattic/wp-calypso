/**
 * /* eslint-disable wpcalypso/jsx-classname-namespace
 *
 */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { url as mediaUrl } from 'calypso/lib/media/utils';
import QueryMedia from 'calypso/components/data/query-media';
import getMediaItem from 'calypso/state/selectors/get-media-item';

const ProductImage = ( { siteId, imageId, image } ) => {
	if ( ! siteId || ! imageId ) {
		return null;
	}

	if ( ! image ) {
		return (
			<figure className="dialog__editor-simple-payments-modal-figure is-placeholder">
				<QueryMedia siteId={ siteId } mediaId={ imageId } />
			</figure>
		);
	}

	const url = mediaUrl( image, { size: 'medium' } );

	return (
		<div className="dialog__editor-simple-payments-modal-figure-container">
			<figure className="dialog__editor-simple-payments-modal-figure">
				<img className="dialog__editor-simple-payments-modal-image" src={ url } alt="product" />
			</figure>
		</div>
	);
};

export default connect( ( state, { siteId, imageId } ) => ( {
	image: imageId ? getMediaItem( state, siteId, imageId ) : null,
} ) )( ProductImage );
