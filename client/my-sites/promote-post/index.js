import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { addQueryArgs } from 'calypso/lib/url';
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

	// Compatibility: Redirects request from clients that are using the old navigation style
	page( getAdvertisingDashboardPath( '/:site/campaigns/:campaignId' ), ( context ) => {
		const { site, campaignId } = context.params;
		const urlQueryArgs = context.query;
		page.redirect(
			addQueryArgs(
				urlQueryArgs,
				getAdvertisingDashboardPath( `/campaigns/${ campaignId }/${ site }` )
			)
		);
	} );

	promotePage( getAdvertisingDashboardPath( '/promote/:item?/:site?' ), promoteWidget );

	promotePage( getAdvertisingDashboardPath( '/:tab?/promote/:item?/:site?' ), promoteWidget );
};
