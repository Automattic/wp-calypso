/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import * as controller from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

/**
 * Style dependencies
 */
import '../../jetpack-connect/style.scss';

export default function () {
	page(
		'/purchase-product/:type(jetpack_search|wpcom_search)/:interval(yearly|monthly)?',
		controller.redirectToSitelessCheckout,
		controller.redirectToLogin,
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.purchase,
		makeLayout,
		clientRender
	);
}
