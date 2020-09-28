/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { hideMasterbar } from 'state/ui/actions';
import Header from './header';
import JetpackComFooter from './jpcom-footer';
import { setLocale } from 'state/ui/language/actions';
import { addQueryArgs } from 'lib/route';

export function jetpackPricingContext( context: PageJS.Context, next: Function ) {
	const urlQueryArgs = context.query;
	const { locale } = context.params;

	if ( locale ) {
		context.store.dispatch( setLocale( locale ) );
		page.redirect( addQueryArgs( urlQueryArgs, `/pricing` ) );
	}

	context.store.dispatch( hideMasterbar() );
	context.header = <Header />;
	context.footer = <JetpackComFooter />;
	next();
}
