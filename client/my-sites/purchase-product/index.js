/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import * as controller from './controller';
import { login } from 'lib/paths';
import { makeLayout, render as clientRender } from 'controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	const user = userFactory();
	const isLoggedOut = ! user.get();

	if ( isLoggedOut ) {
		page( '/purchase-product/:type(jetpack_search)/:interval(yearly|monthly)?', ( { path } ) =>
			page( login( { isNative: true, isJetpack: true, redirectTo: path } ) )
		);
	} else {
		page(
			'/purchase-product/:type(jetpack_search)/:interval(yearly|monthly)?',
			controller.persistMobileAppFlow,
			controller.setMasterbar,
			controller.purchase,
			makeLayout,
			clientRender
		);
	}
}
