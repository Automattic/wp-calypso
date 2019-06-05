/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Pages from './main';

export function pages( context, next ) {
	context.primary = <Pages status={ context.params.status } search={ context.query.s } />;
	next();
}
