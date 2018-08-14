/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ImportMain from 'my-sites/import-new/main';

export function siteImporter( context, next ) {
	context.primary = React.createElement( ImportMain );
	next();
}
