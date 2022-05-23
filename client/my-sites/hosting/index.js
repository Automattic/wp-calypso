import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { layout, activationLayout } from './controller';

export default function () {
	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );
	page( '/hosting-config/:site_id', siteSelection, navigation, layout, makeLayout, clientRender );

	page(
		'/hosting-config/activate/:site_id',
		siteSelection,
		navigation,
		activationLayout,
		makeLayout,
		clientRender
	);
}
