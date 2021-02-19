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
import { valueToEnum } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import Header from './header';
import JetpackComFooter from 'calypso/jetpack-cloud/sections/pricing/jpcom-footer';
import PartnerPortalSidebar from 'calypso/jetpack-cloud/sections/partner-portal/sidebar';
import SelectPartnerKey from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key';
import Licenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/licenses';
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
	const { s: search, sort_field, sort_direction } = context.query;
	const filter = valueToEnum< LicenseFilter >(
		LicenseFilter,
		context.params.state,
		LicenseFilter.NotRevoked
	);
	const sortField = valueToEnum< LicenseSortField >(
		LicenseSortField,
		sort_field,
		LicenseSortField.IssuedAt
	);
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
