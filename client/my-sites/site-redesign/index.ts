import page from '@automattic/calypso-router';
import {
	makeLayout,
	redirectIfCurrentUserCannot,
	redirectLoggedOut,
	render,
} from 'calypso/controller';
import { sites, siteSelection } from 'calypso/my-sites/controller';
import { renderSiteRedesign } from './controller';

export default function () {
	page( '/site-redesign', redirectLoggedOut, siteSelection, sites, makeLayout, render );
	page(
		'/site-redesign/:site',
		redirectLoggedOut,
		siteSelection,
		redirectIfCurrentUserCannot( 'manage_options' ),
		redirectIfCurrentUserCannot( 'edit_theme_options' ),
		renderSiteRedesign,
		makeLayout,
		render
	);
}
