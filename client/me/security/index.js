/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import controller from './controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
	 '/me/security',
	 meController.sidebar,
	 controller.password,
	 makeLayout,
	 clientRender
	);
	page(
	 '/me/security/two-step',
	 meController.sidebar,
	 controller.twoStep,
	 makeLayout,
	 clientRender
	);
	page(
	 '/me/security/connected-applications',
	 meController.sidebar,
	 controller.connectedApplications,
	 makeLayout,
	 clientRender
	);
	page(
	 '/me/security/connected-applications/:application_id',
	 meController.sidebar,
	 controller.connectedApplication,
	 makeLayout,
	 clientRender
	);
	page(
	 '/me/security/account-recovery',
	 meController.sidebar,
	 controller.accountRecovery,
	 makeLayout,
	 clientRender
	);
}
