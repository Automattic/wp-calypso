import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import { promoteWidget, promotedPosts, redirectToPrimarySite } from './controller';
import { getAdvertisingDashboardPath } from './utils';

export default () => {
	page(
		getAdvertisingDashboardPath( '/' ),
		redirectToPrimarySite,
		sites,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:site?/promote/:item?' ),
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promoteWidget,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:site?/:tab?' ),
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promotedPosts,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:site?/:tab?/promote/:item?' ),
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promoteWidget,
		makeLayout,
		clientRender
	);
};
