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

export default function() {
	if ( config.isEnabled( 'me/billing-history' ) ) {
		page( '/me/billing', meController.sidebar, controller.billingHistory );
		page( '/me/billing/:transaction_id', meController.sidebar, controller.transaction );
	}
};
