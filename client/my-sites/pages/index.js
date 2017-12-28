/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'client/my-sites/controller';
import pagesController from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'client/controller';

export default function() {
	if ( config.isEnabled( 'manage/pages' ) ) {
		page(
			'/pages/:status?/:domain?',
			siteSelection,
			navigation,
			pagesController.pages,
			makeLayout,
			clientRender
		);
	}
}
