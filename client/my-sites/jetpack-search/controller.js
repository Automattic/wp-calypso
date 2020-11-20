/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackSearchIndex from './main';

/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
export function jetpackSearchIndex( context, next ) {
	context.primary = <JetpackSearchIndex />;
	next();
}
