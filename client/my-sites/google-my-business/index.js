/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { newAccount, selectBusinessType } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
		'/google-my-business',
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/google-my-business/:site_id/select-business-type',
		siteSelection,
		navigation,
		selectBusinessType,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'google-my-business' ) ) {
		page(
			'/google-my-business/:site_id/new',
			siteSelection,
			navigation,
			newAccount,
			makeLayout,
			clientRender
		);
	}
}
