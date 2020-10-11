/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discover } from './controller';
import { initAbTests, sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page( '/discover', updateLastRoute, initAbTests, sidebar, discover, makeLayout, clientRender );
}
