import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import {
	campaignDetails,
	checkValidTabInNavigation,
} from 'calypso/my-sites/promote-post-i2/controller';
import { promoteWidget, promotedPosts, redirectToPrimarySite } from './controller';
import { getAdvertisingDashboardPath } from './utils';

const promotePage = ( url, controller ) => {
	page(
		url,
		redirectToPrimarySite,
		siteSelection,
		navigation,
		controller,
		makeLayout,
		clientRender
	);
};

export default () => {
	page(
		getAdvertisingDashboardPath( '/' ),
		redirectToPrimarySite,
		sites,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:tab?/:site?' ),
		checkValidTabInNavigation,
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promotedPosts,
		makeLayout,
		clientRender
	);

	promotePage( getAdvertisingDashboardPath( '/campaigns/:campaignId/:site?' ), campaignDetails );

	promotePage( getAdvertisingDashboardPath( '/promote/:item?/:site?' ), promoteWidget );

	promotePage( getAdvertisingDashboardPath( '/:tab?/promote/:item?/:site?' ), promoteWidget );
};
