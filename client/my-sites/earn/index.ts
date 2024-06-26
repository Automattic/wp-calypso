import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	redirectToAdsEarnings,
	redirectToAdsSettings,
	redirectToSettings,
	layout,
} from './controller';

const earnPath = ! isJetpackCloud() ? '/earn' : '/monetize';

export default function () {
	page( earnPath, siteSelection, sites, makeLayout, clientRender );
	page( earnPath + '/supporters', siteSelection, sites, makeLayout, clientRender );
	page( earnPath + '/payments', siteSelection, sites, makeLayout, clientRender );
	// This is legacy, we are leaving it here because it may have been public
	page(
		earnPath + '/memberships/:site_id',
		( { params } ) => page.redirect( earnPath + '/payments/' + params.site_id ),
		makeLayout,
		clientRender
	);
	page(
		earnPath + '/memberships',
		() => page.redirect( earnPath + '/payments' ),
		makeLayout,
		clientRender
	);

	page( earnPath + '/ads-settings', siteSelection, sites, makeLayout, clientRender );
	page( earnPath + '/ads-earnings', siteSelection, sites, makeLayout, clientRender );

	page( earnPath + '/refer-a-friend', siteSelection, sites, makeLayout, clientRender );

	// These are legacy URLs to redirect if they are present anywhere on the web.
	page( earnPath + '/payments-plans/:site_id', redirectToSettings, makeLayout, clientRender );
	page( '/ads/earnings/:site_id', redirectToAdsEarnings, makeLayout, clientRender );
	page( '/ads/settings/:site_id', redirectToAdsSettings, makeLayout, clientRender );
	page( '/ads/:site_id', redirectToAdsEarnings, makeLayout, clientRender );
	page( '/ads', '/earn' );
	page( '/ads/*', '/earn' );

	page( earnPath + '/:site_id', siteSelection, navigation, layout, makeLayout, clientRender );

	page(
		earnPath + '/:section/:site_id',
		siteSelection,
		navigation,
		layout,
		makeLayout,
		clientRender
	);
}
