import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import renderUpgradeJetpack from './controller';

export default function () {
	page(
		'/upgrade-jetpack/:site',
		siteSelection,
		navigation,
		renderUpgradeJetpack,
		makeLayout,
		clientRender
	);
}
