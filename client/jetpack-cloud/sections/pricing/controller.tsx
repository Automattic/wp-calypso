/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Header from './header';
import JetpackComFooter from './jpcom-footer';
import { addQueryArgs } from 'calypso/lib/route';
import { getPlanRecommendationFromContext } from 'calypso/my-sites/plans/jetpack-plans/plan-upgrade/utils';
import { hideMasterbar } from 'calypso/state/ui/actions';
import { setLocale } from 'calypso/state/ui/language/actions';

export function jetpackPricingContext( context: PageJS.Context, next: () => void ): void {
	const { pathname } = context;
	const urlQueryArgs = context.query;
	const { site: siteFromUrl } = urlQueryArgs;
	const { locale } = context.params;
	const planRecommendation = getPlanRecommendationFromContext( context );

	if ( locale ) {
		context.store.dispatch( setLocale( locale ) );
		page.redirect( addQueryArgs( urlQueryArgs, `/pricing` ) );
	}

	if ( /\/(pricing|plans)$/.test( pathname ) && siteFromUrl ) {
		page.redirect( addQueryArgs( urlQueryArgs, `${ pathname }/${ siteFromUrl }` ) );
	}

	context.store.dispatch( hideMasterbar() );
	context.header = <Header hideTitle={ !! planRecommendation } />;
	context.footer = <JetpackComFooter />;
	next();
}
