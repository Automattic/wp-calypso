/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default () => {
	if ( config.isEnabled( 'concierge-chats' ) ) {
		page( '/me/concierge/:siteSlug', controller.book, makeLayout, clientRender );
	}
};
