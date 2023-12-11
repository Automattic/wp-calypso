import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	jetpackSearchMain,
	showJetpackIsDisconnected,
	showUpsellIfNoSearch,
} from 'calypso/my-sites/jetpack-search/controller';
import { jetpackSearchMainPath } from './paths';

export default function () {
	/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
	page(
		jetpackSearchMainPath( ':site' ),
		siteSelection,
		navigation,
		jetpackSearchMain,
		showUpsellIfNoSearch,
		showJetpackIsDisconnected,
		makeLayout,
		clientRender
	);
	/* handles /jetpack-search, see `jetpackSearchMainPath` */
	page( jetpackSearchMainPath(), siteSelection, sites, makeLayout, clientRender );
}
