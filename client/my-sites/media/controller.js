import page from '@automattic/calypso-router';
import { createElement } from 'react';
import { getSiteFragment } from 'calypso/lib/route';
import MediaComponent from 'calypso/my-sites/media/main';

export default {
	media: function ( context, next ) {
		if ( ! getSiteFragment( context.path ) ) {
			return page.redirect( '/media' );
		}

		const mediaId = context.params.mediaId ? parseInt( context.params.mediaId ) : null;
		// Render
		context.primary = createElement( MediaComponent, {
			filter: context.params.filter,
			search: context.query.s,
			mediaId,
		} );
		next();
	},
};
