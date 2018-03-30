/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */

import MediaComponent from 'my-sites/media/main';

export default {
	media: function( context, next ) {
		// Render
		context.primary = React.createElement( MediaComponent, {
			filter: context.params.filter,
			search: context.query.s,
		} );
		next();
	},
};
