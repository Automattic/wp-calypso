/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import { comments } from './controller';
import config from 'config';

export default function() {
	if ( config.isEnabled( 'comments/management' ) ) {
		page( '/comments',
			controller.siteSelection,
			controller.sites
		);

		page( '/comments/:status?/:site',
			controller.siteSelection,
			controller.navigation,
			comments
		);
	}
}
