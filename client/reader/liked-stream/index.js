/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { likes } from './controller';
import { updateLastRoute, sidebar } from 'calypso/reader/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	page( '/activities/likes', updateLastRoute, sidebar, likes, makeLayout, clientRender );
}
