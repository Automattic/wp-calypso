import page from '@automattic/calypso-router';
import { makeLayout, redirectLoggedOut, render } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { renderSiteRedesign, requireSiteRedesignAccess } from './controller';

export default function () {
	page(
		'/site-redesign/:site',
		redirectLoggedOut,
		siteSelection,
		requireSiteRedesignAccess,
		renderSiteRedesign,
		navigation,
		makeLayout,
		render
	);
}
