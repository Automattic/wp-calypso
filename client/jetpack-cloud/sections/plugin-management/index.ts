import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { scrollTopIfNoHash } from 'calypso/my-sites/plugins/controller';
import { verifyUnpaidInvoices } from '../partner-portal/controller';
import { pluginManagementContext, pluginDetailsContext } from './controller';

export default function (): void {
	page( '/plugins', siteSelection, sites, verifyUnpaidInvoices, makeLayout, clientRender );
	page(
		'/plugins/:filter(manage|active|inactive|updates)',
		pluginManagementContext,
		verifyUnpaidInvoices,
		makeLayout,
		clientRender
	);
	page(
		'/plugins/:filter(manage|active|inactive|updates)/:site',
		siteSelection,
		navigation,
		pluginManagementContext,
		verifyUnpaidInvoices,
		makeLayout,
		clientRender
	);
	page(
		'/plugins/:plugin',
		scrollTopIfNoHash,
		pluginDetailsContext,
		verifyUnpaidInvoices,
		makeLayout,
		clientRender
	);
	page(
		'/plugins/:plugin/:site',
		scrollTopIfNoHash,
		siteSelection,
		navigation,
		pluginDetailsContext,
		verifyUnpaidInvoices,
		makeLayout,
		clientRender
	);
}
