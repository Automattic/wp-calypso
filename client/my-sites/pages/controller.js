/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import Pages from 'my-sites/pages/main';

const controller = {
	pages: function( context, next ) {
		context.primary = React.createElement( Pages, {
			status: context.params.status,
			search: context.query.s,
		} );
		next();
	},
};

export default controller;
