/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import LogItem from './components/log-item';

export function jetpackCloud( context, next ) {
	context.primary = <div>Hi, this is the Jetpack.com Cloud!</div>;
	next();
}
