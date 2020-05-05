/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout, render as clientRender } from 'controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	// not putting category or email address in params, since `page`
	// currently double-decodes the URI before doing route matching
	// https://github.com/visionmedia/page.js/issues/306
	page( '/mailing-lists/unsubscribe', controller.unsubscribe, makeLayout, clientRender );
}
