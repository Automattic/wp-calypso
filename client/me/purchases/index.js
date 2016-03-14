/**
 * External Dependencies
 */
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
		paths.confirmCancelPurchase(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.confirmCancelPurchase
	);

	page(
		paths.editCardDetails(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.editCardDetails
	);

	page(
		paths.editSpecificCardDetails(),
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
		paths.listNotice(),
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

	page(
		paths.managePurchaseDestination(),
		meController.sidebar,
		controller.noSitesMessage,
		controller.managePurchase
	);
};
