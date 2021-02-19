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
import { stringToLicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import Header from './header';
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import PartnerPortalSidebar from 'calypso/jetpack-cloud/sections/partner-portal/sidebar';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key';
import Licenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/licenses';

export function partnerKeyContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = <SelectPartnerKey />;
	context.footer = <JetpackComFooter />;
	next();
}

export function partnerPortalContext( context: PageJS.Context, next: () => void ): void {
	const { s: search, sort_field: sortField, sort_direction: sortDirection } = context.query;
	const licenseFilter = stringToLicenseFilter( context.params.state );

	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = (
		<Licenses
			licenseFilter={ licenseFilter }
			search={ search || '' }
			sortDirection={ sortDirection }
			sortField={ sortField }
		/>
	);
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
