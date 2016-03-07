/**
 * Internal dependencies
 */
import config from 'config';
import { makeLoggedOutLayout } from 'controller';
import { details, fetchThemeDetailsData } from './controller';
import { dispatchSetSectionMiddlewareFactory } from 'lib/react-helpers';

const dispatchThemesWithSidebar = dispatchSetSectionMiddlewareFactory( {
	name: 'themes',
	group: 'sites',
	secondary: true
} );

const dispatchThemeNoSidebar = dispatchSetSectionMiddlewareFactory( {
	name: 'theme',
	group: 'sites',
	secondary: false
} );

// FIXME: These routes will SSR the logged-out Layout even if logged-in.
// While subsequently replaced by the logged-in Layout on the client-side,
// we'll want to render it on the server, too.

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.
const designRoutes = {
	'/design': [ dispatchThemesWithSidebar, makeLoggedOutLayout ],
	'/design/type/:tier': [ dispatchThemesWithSidebar, makeLoggedOutLayout ]
};

const themesRoutes = {
	'/theme/:slug/:section?/:site_id?': [ dispatchThemeNoSidebar, fetchThemeDetailsData, details, makeLoggedOutLayout ]
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
