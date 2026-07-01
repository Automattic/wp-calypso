import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import {
	fediverseAccount,
	fediverseAuthorProfile,
	fediverseIdRedirect,
	fediverseLanding,
	fediverseProfileFollowers,
	fediverseProfileFollowing,
} from './controller';

export default function () {
	page( '/reader/fediverse', sidebar, fediverseLanding, makeLayout, clientRender );
	page( '/reader/fediverse/:id(\\d+)', fediverseIdRedirect );
	// More specific `:id/profile/:actor` route registered before the
	// generic `:id/:tab` so the actor segment takes precedence.
	page(
		'/reader/fediverse/:id(\\d+)/profile/:actor',
		sidebar,
		fediverseAuthorProfile,
		makeLayout,
		clientRender
	);
	page(
		'/reader/fediverse/:id(\\d+)/profile/:actor/followers',
		sidebar,
		fediverseProfileFollowers,
		makeLayout,
		clientRender
	);
	page(
		'/reader/fediverse/:id(\\d+)/profile/:actor/following',
		sidebar,
		fediverseProfileFollowing,
		makeLayout,
		clientRender
	);
	page( '/reader/fediverse/:id(\\d+)/:tab', sidebar, fediverseAccount, makeLayout, clientRender );
}
