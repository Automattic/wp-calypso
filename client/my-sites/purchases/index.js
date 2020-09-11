/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { purchases } from './controller';

export default () => {
	page( '/purchases/:site?', siteSelection, navigation, purchases, makeLayout, clientRender );
};
