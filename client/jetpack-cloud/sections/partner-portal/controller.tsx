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
import { getActivePartnerKey } from 'calypso/state/partner-portal/partner/selectors';
import { getLicenseStateByQueryParamValue } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import Header from './header';
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import PartnerPortalSidebar from 'calypso/jetpack-cloud/sections/partner-portal/sidebar';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key';
import LicenseList from 'calypso/jetpack-cloud/sections/partner-portal/license-list';

export function partnerKeyContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = <SelectPartnerKey />;
	context.footer = <JetpackComFooter />;
	next();
}

export function partnerPortalContext( context: PageJS.Context, next: () => void ): void {
	const licenseState = getLicenseStateByQueryParamValue( context.params.state );

	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = <LicenseList licenseState={ licenseState } search={ context.query.s || '' } />;
	context.footer = <JetpackComFooter />;
	next();
}

export function requirePartnerKeyContext( context: PageJS.Context, next: () => void ): void {
	const state = context.store.getState();
	const hasKey = getActivePartnerKey( state );

	if ( hasKey ) {
		next();
		return;
	}

	page.redirect(
		addQueryArgs(
			{
				return: window.location.pathname + window.location.search,
			},
			'/partner-portal/partner-key'
		)
	);
}
