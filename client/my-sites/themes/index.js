/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';;
import { navigation, siteSelection } from 'my-sites/controller';
import { singleSite, multiSite, loggedOut, details, makeLoggedOutLayout } from './controller';

export default function( router, renderer ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();

	if ( config.isEnabled( 'manage/themes' ) ) {
		if ( isLoggedIn ) {
			router( '/design', multiSite, navigation, siteSelection );
			router( '/design/:site_id', singleSite, navigation, siteSelection );
			router( '/design/type/:tier', multiSite, navigation, siteSelection );
			router( '/design/type/:tier/:site_id', singleSite, navigation, siteSelection );
		} else {
			router( '/design', loggedOut, makeLoggedOutLayout );
			router( '/design/type/:tier', loggedOut, makeLoggedOutLayout );
		}
		router( '/design*', renderer );
	}

	if ( config.isEnabled( 'manage/themes/details' ) ) {
		if ( isLoggedIn ) {
			router( '/themes/:slug/:section?/:site_id?', details );
		} else {
			router( '/themes/:slug/:section?/:site_id?', details, makeLoggedOutLayout );
		};
		router( '/themes*', renderer );
	}
};
