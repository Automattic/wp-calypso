import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

import '../../jetpack-connect/style.scss';

export default function () {
	page(
		'/purchase-product/:type(jetpack_search|wpcom_search)/:interval(yearly|monthly)?',
		controller.redirectToLogin,
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.purchase,
		makeLayout,
		clientRender
	);
}
