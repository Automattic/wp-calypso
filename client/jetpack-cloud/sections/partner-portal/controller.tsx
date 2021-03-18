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
import {
	publicToInternalLicenseFilter,
	publicToInternalLicenseSortField,
	valueToEnum,
	ensurePartnerPortalReturnUrl,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import Header from './header';
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import PartnerPortalSidebar from 'calypso/jetpack-cloud/sections/partner-portal/sidebar';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key';
import Licenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/licenses';
import IssueLicense from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';

export function partnerKeyContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = <SelectPartnerKey />;
	context.footer = <JetpackComFooter />;
	next();
}

export function partnerPortalContext( context: PageJS.Context, next: () => void ): void {
	const { s: search, sort_field, sort_direction, page } = context.query;
	const filter = publicToInternalLicenseFilter( context.params.filter, LicenseFilter.NotRevoked );
	const currentPage = parseInt( page ) || 1;
	const sortField = publicToInternalLicenseSortField( sort_field, LicenseSortField.IssuedAt );
	const sortDirection = valueToEnum< LicenseSortDirection >(
		LicenseSortDirection,
		sort_direction,
		LicenseSortDirection.Descending
	);

	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = (
		<Licenses
			filter={ filter }
			search={ search || '' }
			currentPage={ currentPage }
			sortDirection={ sortDirection }
			sortField={ sortField }
		/>
	);
	context.footer = <JetpackComFooter />;
	next();
}

export function issueLicenseContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.secondary = <PartnerPortalSidebar path={ context.path } />;
	context.primary = <IssueLicense />;
	context.footer = <JetpackComFooter />;
	next();
}

export function requirePartnerKeyContext( context: PageJS.Context, next: () => void ): void {
	const state = context.store.getState();
	const hasKey = getActivePartnerKey( state );
	const { pathname, search } = window.location;

	if ( hasKey ) {
		next();
		return;
	}

	const returnUrl = ensurePartnerPortalReturnUrl( pathname + search );

	page.redirect(
		addQueryArgs(
			{
				return: returnUrl,
			},
			'/partner-portal/partner-key'
		)
	);
}
