/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import MediaComponent from 'my-sites/media/main';
import { getSiteFragment } from 'lib/route';

export default {
	media: function ( context, next ) {
		if ( ! getSiteFragment( context.path ) ) {
			return page.redirect( '/media' );
		}

		const mediaId = context.params.mediaId ? parseInt( context.params.mediaId ) : null;
		// Render
		context.primary = React.createElement( MediaComponent, {
			filter: context.params.filter,
			search: context.query.s,
			mediaId,
		} );
		next();
	},
};
