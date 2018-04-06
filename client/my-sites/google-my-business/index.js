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
import { newAccount, selectBusinessType, selectLocation } from './controller';
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
		'/google-my-business/:site',
		context => page.redirect( `/google-my-business/${ context.params.site }/select-business-type` )
	);

	if ( config.isEnabled( 'google-my-business' ) ) {
		page(
			'/google-my-business/:site/new',
			siteSelection,
			navigation,
			newAccount,
			makeLayout,
			clientRender
		);
	}

	page(
		'/google-my-business/:site/select-business-type',
		siteSelection,
		navigation,
		selectBusinessType,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'google-my-business' ) ) {
		page(
			'/google-my-business/:site/select-location',
			siteSelection,
			navigation,
			selectLocation,
			makeLayout,
			clientRender
		);
	}
}
