/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import controller from './controller';
import mySitesController from 'my-sites/controller';

export default function() {
	if ( isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/settings/export/guided/:host_slug?/:site_id',
			mySitesController.siteSelection,
			mySitesController.navigation,
			controller.guidedTransfer
		);
	}

	if ( isEnabled( 'manage/export' ) ) {
		page(
			'/settings/export/:site_id',
			mySitesController.siteSelection,
			mySitesController.navigation,
			controller.exportSite
		);
	}
}
