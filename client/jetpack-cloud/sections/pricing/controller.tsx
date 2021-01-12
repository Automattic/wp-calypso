/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { hideMasterbar } from 'calypso/state/ui/actions';
import Header from './header';
import JetpackComFooter from './jpcom-footer';
import { setLocale } from 'calypso/state/ui/language/actions';
import { addQueryArgs } from 'calypso/lib/route';

export function jetpackPricingContext( context: PageJS.Context, next: () => void ): void {
	const urlQueryArgs = context.query;
	const { site: siteFromUrl, ...restQueryArgs } = urlQueryArgs;
	const { locale } = context.params;

	if ( locale ) {
		context.store.dispatch( setLocale( locale ) );
		page.redirect( addQueryArgs( urlQueryArgs, `/pricing` ) );
	}

	if ( siteFromUrl ) {
		page.redirect( addQueryArgs( restQueryArgs, `/plans/${ siteFromUrl }` ) );
	}

	context.store.dispatch( hideMasterbar() );
	context.header = <Header urlQueryArgs={ urlQueryArgs } />;
	context.footer = <JetpackComFooter />;
	next();
}
