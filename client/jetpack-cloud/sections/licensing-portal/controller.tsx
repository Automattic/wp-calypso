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
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import LicensingPortalSidebar from 'calypso/jetpack-cloud/sections/licensing-portal/sidebar';
import InspectLicense from 'calypso/jetpack-cloud/sections/licensing-portal/inspect-licenses';

export function licensingPortalContext( context: PageJS.Context, next: Function ) {
	const urlQueryArgs = context.query;
	const { locale } = context.params;

	if ( locale ) {
		context.store.dispatch( setLocale( locale ) );
		page.redirect( addQueryArgs( urlQueryArgs, `/licensing-portal` ) );
	}

	context.header = <Header/>;
	context.secondary = <LicensingPortalSidebar path={ context.path }/>;
	context.primary = <InspectLicense/>;
	context.footer = <JetpackComFooter/>;
	next();
}
