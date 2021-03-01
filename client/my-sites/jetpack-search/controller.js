/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackSearchMain from './main';

/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
export function jetpackSearchMain( context, next ) {
	context.primary = <JetpackSearchMain />;
	next();
}
