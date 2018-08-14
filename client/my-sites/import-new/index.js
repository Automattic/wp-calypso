/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteImporter } from './controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/import/:site_id?', siteSelection, navigation, siteImporter, makeLayout, clientRender );
}
