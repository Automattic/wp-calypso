/** @format */

/**
 * External dependencies
 */

// import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { onboarding } from './controller';

export default function() {
	page( '/looka/:domain?', siteSelection, navigation, onboarding, makeLayout, clientRender );
}
