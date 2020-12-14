/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/route';
import { getActivePartnerKey } from 'calypso/state/licensing-portal/selectors';
import Header from './header';
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import LicensingPortalSidebar from 'calypso/jetpack-cloud/sections/licensing-portal/sidebar';
import InspectLicense from 'calypso/jetpack-cloud/sections/licensing-portal/inspect-license';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/licensing-portal/select-partner-key';

export function partnerKeyContext( context: PageJS.Context, next ) {
	context.header = <Header />;
	context.secondary = <LicensingPortalSidebar path={ context.path } />;
	context.primary = <SelectPartnerKey />;
	context.footer = <JetpackComFooter />;
	next();
}

export function licensingPortalContext( context: PageJS.Context, next ) {
	context.header = <Header />;
	context.secondary = <LicensingPortalSidebar path={ context.path } />;
	context.primary = <InspectLicense />;
	context.footer = <JetpackComFooter />;
	next();
}

export function requirePartnerKeyContext( context, next ) {
	const state = context.store.getState();
	const hasKey = getActivePartnerKey( state );

	if ( hasKey ) {
		next();
		return;
	}

	page.redirect(
		addQueryArgs(
			{
				return: window.location.pathname,
			},
			'/licensing-portal/partner-key'
		)
	);
}
