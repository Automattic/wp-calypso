/**
 * External dependencies
 */
import React from 'react';

export function jetpackCloud( context, next ) {
	context.primary = <div>Hi, this is the Jetpack.com Cloud!</div>;
	next();
}
