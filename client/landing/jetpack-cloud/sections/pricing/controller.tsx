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
import { setLocale } from 'state/ui/language/actions';

export function jetpackPricingContext( context, next ) {
	const { locale } = context.params;

	if ( locale ) {
		context.store.dispatch( setLocale( locale ) );
	}

	context.store.dispatch( hideMasterbar() );
	context.header = <Header />;
	context.footer = <JetpackComFooter />;
	next();
}
