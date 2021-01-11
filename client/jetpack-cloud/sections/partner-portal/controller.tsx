/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import type PageJS from 'page';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/route';
import { getActivePartnerKey } from 'calypso/state/partner-portal/selectors';
import Header from './header';
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import PartnerPortalSidebar from 'calypso/jetpack-cloud/sections/partner-portal/sidebar';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key';

export function partnerKeyContext( context: PageJS.Context, next: () => any ) {
	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = <SelectPartnerKey />;
	context.footer = <JetpackComFooter />;
	next();
}

export function partnerPortalContext( context: PageJS.Context, next: () => any ) {
	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = <div>WIP: Licesing Portal Goes Here</div>;
	context.footer = <JetpackComFooter />;
	next();
}

export function requirePartnerKeyContext( context: PageJS.Context, next: () => any ) {
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
			'/partner-portal/partner-key'
		)
	);
}
