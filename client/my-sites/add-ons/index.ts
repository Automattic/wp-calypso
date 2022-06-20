import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { addOnsSiteSelectionHeader, addOnsManagement, redirectIfNotEnabled } from './controller';

export default function () {
	page(
		'/add-ons',
		redirectIfNotEnabled,
		siteSelection,
		addOnsSiteSelectionHeader,
		sites,
		makeLayout,
		clientRender
	);
	page(
		'/add-ons/:site',
		redirectIfNotEnabled,
		siteSelection,
		addOnsSiteSelectionHeader,
		navigation,
		addOnsManagement,
		makeLayout,
		clientRender
	);
}
