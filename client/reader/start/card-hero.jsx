// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Internal dependencies
import { getSite } from 'state/reader/sites/selectors';
import { getPostBySiteAndId } from 'state/reader/posts/selectors';
import safeImageUrl from 'lib/safe-image-url';
import resizeImageUrl from 'lib/resize-image-url';

const StartCardHero = ( { site, post } ) => {
	let headerImageUrl = get( site, 'header_image.url' );

	if ( ! headerImageUrl && post ) {
		headerImageUrl = get( post, 'canonical_image.uri' );
	}

	// Resize it with Photon
	let resizedHeaderImageUrl;
	if ( headerImageUrl ) {
		resizedHeaderImageUrl = resizeImageUrl( safeImageUrl( headerImageUrl ), { resize: '350,70' } );
	}

	// Prepare the style attribute
	let heroStyle;
	if ( resizedHeaderImageUrl ) {
		heroStyle = {
			backgroundImage: `url("${ resizedHeaderImageUrl }")`
		};
	}

	return (
		<div className="reader-start-card__hero" style={ heroStyle }></div>
	);
};

StartCardHero.propTypes = {
	siteId: React.PropTypes.number.isRequired,
	postId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			site: getSite( state, ownProps.siteId ),
			post: getPostBySiteAndId( state, ownProps.siteId, ownProps.postId )
		};
	}
)( StartCardHero );
