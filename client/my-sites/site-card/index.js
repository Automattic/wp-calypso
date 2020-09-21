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
	page( '/site-card/:domain?', siteSelection, navigation, navigation, makeLayout, clientRender ); // 4th arguement should be null (context.primary), but null is not a function
}
