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
import { onboarding, editor, explore } from './controller';

export default function() {
	page( '/looka/onboarding', siteSelection, navigation, onboarding, makeLayout, clientRender );
	page( '/looka/explore', siteSelection, navigation, explore, makeLayout, clientRender );
	page( '/looka/editor', siteSelection, navigation, editor, makeLayout, clientRender );
}
