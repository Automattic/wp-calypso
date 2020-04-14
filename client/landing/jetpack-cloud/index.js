/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';

export default function () {
	page( '/', context => {
		let redirectPath = '/error';

		if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
			redirectPath = '/backups';
		} else if ( config.isEnabled( 'jetpack-cloud/scan' ) ) {
			redirectPath = '/scan';
		}

		if ( context.querystring ) {
			redirectPath += `?${ context.querystring }`;
		}

		page.redirect( redirectPath );
	} );
}
