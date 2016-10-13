/**
 * External Dependencies
 */
import config from 'config';
import page from 'page';

/**
 * Internal Dependencies
 */
import meController from 'me/controller';
import controller from './controller';
import paths from './paths';

export default function() {
	page(
		paths.cancelPurchase(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.cancelPurchase
	);

	page(
		paths.cancelPrivateRegistration(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.cancelPrivateRegistration
	);

	page(
		paths.confirmCancelDomain(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.confirmCancelDomain
	);

	page(
		paths.addCardDetails(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.addCardDetails
	);

	if ( config.isEnabled( 'manage/payment-methods' ) ) {
		page(
			paths.addCreditCard(),
			meController.sidebar,
			controller.addCreditCard
		);
	}

	page(
		paths.editCardDetails(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.editCardDetails
	);

	page(
		paths.list(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.list
	);

	page(
		paths.managePurchase(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.managePurchase
	);
}
