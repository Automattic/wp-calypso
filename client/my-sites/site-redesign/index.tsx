import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, redirectLoggedOut, render } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import SiteRedesign from './workspace';

export default function ( router: typeof import( '@automattic/calypso-router' ).default ) {
	router(
		'/site-redesign/:site_id',
		redirectLoggedOut,
		siteSelection,
		( context, next ) => {
			if ( ! isEnabled( 'themes/site-redesign' ) ) {
				page.redirect( `/themes/${ context.params.site_id }` );
				return;
			}
			context.primary = <SiteRedesign />;
			next();
		},
		navigation,
		makeLayout,
		render
	);
}
