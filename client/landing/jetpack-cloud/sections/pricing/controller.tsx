/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StoreFooter from 'jetpack-connect/store-footer';
import { hideMasterbar } from 'state/ui/actions';

export function jetpackPricingContext( context, next ) {
	context.store.dispatch( hideMasterbar() );
	context.footer = <StoreFooter />;
	next();
}
