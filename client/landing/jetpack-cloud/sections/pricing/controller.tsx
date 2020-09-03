/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { hideMasterbar } from 'state/ui/actions';
import Header from './header';
import JetpackComFooter from './jpcom-footer';

export function jetpackPricingContext( context, next ) {
	context.store.dispatch( hideMasterbar() );
	context.header = <Header />;
	context.footer = <JetpackComFooter />;
	next();
}
