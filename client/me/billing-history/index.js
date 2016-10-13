/**
 * External dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import controller from './controller';
import purchasesPaths from 'me/purchases/paths';

export default function() {
	if ( config.isEnabled( 'me/billing-history' ) ) {
		page( purchasesPaths.billingHistory(), meController.sidebar, controller.billingHistory );
		page( purchasesPaths.billingHistoryReceipt(), meController.sidebar, controller.transaction );
	}
};
