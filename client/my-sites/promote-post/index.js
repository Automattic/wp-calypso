import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import { promotedPosts, redirectToPrimarySite } from './controller';

export default () => {
	page( '/advertising/', redirectToPrimarySite, sites, makeLayout, clientRender );

	page(
		'/advertising/:site?/:tab?',
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promotedPosts,
		makeLayout,
		clientRender
	);
};
