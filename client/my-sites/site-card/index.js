/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal Dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	page( '/site-card/:domain?', siteSelection, navigation, null, makeLayout, clientRender );
}
