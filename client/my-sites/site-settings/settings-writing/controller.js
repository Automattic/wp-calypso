/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import WritingMain from 'my-sites/site-settings/settings-writing/main';
import Taxonomies from 'my-sites/site-settings/taxonomies';

export default {
	writing( context, next ) {
		context.primary = React.createElement( WritingMain );
		next();
	},

	taxonomies( context, next ) {
		context.primary = React.createElement( Taxonomies, {
			taxonomy: context.params.taxonomy,
			postType: 'post',
		} );
		next();
	},
};
