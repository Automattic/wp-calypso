/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StoreFooter from 'jetpack-connect/store-footer';

export function jetpackPricingContext( context, next ) {
	context.footer = <StoreFooter />;
	next();
}
