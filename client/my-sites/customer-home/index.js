/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import home from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { isEnabled } from 'config';

export default function() {
	page( '/home', siteSelection, sites, makeLayout, clientRender );

	page( '/home/:siteId', siteSelection, navigation, home, makeLayout, clientRender );
}

export const checklistUrl = () =>
	isEnabled( 'customer-home' ) ? '/home/:site' : '/plans/my-plan/:site';
