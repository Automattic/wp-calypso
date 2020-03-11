/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AnimationsPage from './main';

export function animations( context, next ) {
	context.primary = <AnimationsPage />;
	next();
}
