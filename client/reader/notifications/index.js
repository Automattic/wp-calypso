/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { notifications } from './controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	page( '/read/notifications', updateLastRoute, sidebar, notifications, makeLayout, clientRender );
}
