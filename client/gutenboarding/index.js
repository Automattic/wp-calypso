/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { main, redirectIfNotEnabled } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/gutenboarding', redirectIfNotEnabled, main, makeLayout, clientRender );
}
