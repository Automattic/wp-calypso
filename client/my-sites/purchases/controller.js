/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Purchases from 'my-sites/purchases/main';

export const purchases = ( context, next ) => {
	context.primary = <Purchases />;
	next();
};
