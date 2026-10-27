import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	makeLayout,
	redirectIfCurrentUserCannot,
	redirectLoggedOut,
	render,
} from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { renderSiteRedesign } from './controller';

export default function () {
	if ( ! isEnabled( 'themes/site-redesign' ) ) {
		return;
	}
	page(
		'/site-redesign/:site',
		redirectLoggedOut,
		siteSelection,
		redirectIfCurrentUserCannot( 'manage_options' ),
		redirectIfCurrentUserCannot( 'edit_theme_options' ),
		renderSiteRedesign,
		navigation,
		makeLayout,
		render
	);
}
