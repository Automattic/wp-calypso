/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';;
import { navigation, siteSelection } from 'my-sites/controller';
import { singleSite, multiSite, loggedOut, details } from './controller';

const user = userFactory();

const isLoggedIn = !! user.get();

const designRoutes = isLoggedIn
	? {
		'/design': [ multiSite, navigation, siteSelection ],
		'/design/:site_id': [ singleSite, navigation, siteSelection ],
		'/design/type/:tier': [ multiSite, navigation, siteSelection ],
		'/design/type/:tier/:site_id': [ singleSite, navigation, siteSelection ],
	}
	: {
		'/design': [ loggedOut ],
		'/design/type/:tier': [ loggedOut ]
	};

const themesRoutes = {
	'/themes/:slug/:section?/:site_id?': [ details ]
};

const routes = Object.assign( {},
	config.isEnabled( 'manage/themes' ) ? designRoutes : {},
	config.isEnabled( 'manage/themes/details' ) ? themesRoutes : {}
)

export default function( router ) {
	Object.keys( routes ).forEach( route => {
		router( route, ...routes[ route ] );
	} )
};
