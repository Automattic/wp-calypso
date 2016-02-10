/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import userFactory from 'lib/user';;
import { navigation, siteSelection } from 'my-sites/controller';
import { singleSite, multiSite, loggedOut, details, renderPrimary } from './controller';

const user = userFactory();

const isLoggedIn = !! user.get();
const routes = isLoggedIn
	? {
		'/design': [ multiSite ],
		'/design/:site_id': [ singleSite ],
		'/design/type/:tier': [ multiSite ],
		'/design/type/:tier/:site_id': [ singleSite ],
		'/design*': [ navigation, siteSelection ]
	}
	: {
		'/design': [ loggedOut ],
		'/design/type/:tier': [ loggedOut ]
	};

export default function() {
	if ( config.isEnabled( 'manage/themes' ) ) {
		// Does iterating over Object.keys preserve order? If it doesn't, use lodash's mapValues
		Object.keys( routes ).forEach( route => {
			page( route, ...routes[ route ] );
		} )
		page( '/design*', renderPrimary ); // Call explicitly here because client-specific
	}
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		page( '/themes/:slug/:site_id?', details );
		page( '/themes*', renderPrimary ); // Call explicitly here because client-specific
	}
};
