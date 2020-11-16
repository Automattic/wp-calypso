/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { setLocale } from 'calypso/state/ui/language/actions';
import { addQueryArgs } from 'calypso/lib/route';
import Header from './header';
import JetpackComFooter from './jpcom-footer';
import JetpackCloudLicensingSidebar from 'calypso/jetpack-cloud/sections/licensing/sidebar';
import InspectLicense from 'calypso/jetpack-cloud/sections/licensing/inspect-licenses';

export function jetpackLicensingContext( context: PageJS.Context, next: Function ) {
	const urlQueryArgs = context.query;
	const { locale } = context.params;

	if ( locale ) {
		context.store.dispatch( setLocale( locale ) );
		page.redirect( addQueryArgs( urlQueryArgs, `/licenses` ) );
	}

	context.header = <Header />;
	context.secondary = <JetpackCloudLicensingSidebar path={ context.path } />;
	context.primary = <InspectLicense />;
	context.footer = <JetpackComFooter />;
	next();
}
