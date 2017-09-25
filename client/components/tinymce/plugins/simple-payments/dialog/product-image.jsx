/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryMedia from 'components/data/query-media';
import MediaUtils from 'lib/media/utils';
import { getMediaItem } from 'state/selectors';

const ProductImage = ( { siteId, imageId, image } ) => {
	if ( ! siteId || ! imageId ) {
		return null;
	}

	if ( ! image ) {
		return (
			<figure className="editor-simple-payments-modal__figure is-placeholder">
				<QueryMedia siteId={ siteId } mediaId={ imageId } />
			</figure>
		);
	}

	const url = MediaUtils.url( image, { size: 'medium' } );

	return (
		<figure className="editor-simple-payments-modal__figure">
			<img className="editor-simple-payments-modal__image" src={ url } />
		</figure>
	);
};

export default connect( ( state, { siteId, imageId } ) => ( {
	image: imageId ? getMediaItem( state, siteId, imageId ) : null,
} ) )( ProductImage );
