import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	jetpackSearchMain,
	showJetpackIsDisconnected,
} from 'calypso/my-sites/jetpack-search/controller';
import { jetpackSearchMainPath } from './paths';

export default function () {
	/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
	page(
		jetpackSearchMainPath( ':site' ),
		siteSelection,
		navigation,
		jetpackSearchMain,
		showJetpackIsDisconnected,
		makeLayout,
		clientRender
	);
	/* handles /jetpack-search, see `jetpackSearchMainPath` */
	page( jetpackSearchMainPath(), siteSelection, sites, makeLayout, clientRender );
}
