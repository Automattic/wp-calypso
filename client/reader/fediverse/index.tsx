import './style.scss';

import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import {
	fediverseAccount,
	fediverseAuthorProfile,
	fediverseIdRedirect,
	fediverseLanding,
	fediverseProfileFollowers,
	fediverseProfileFollowing,
} from './controller';

export default function () {
	readerPage( '/reader/fediverse', sidebar, fediverseLanding, makeLayout, clientRender );
	readerPage( '/reader/fediverse/:id(\\d+)', fediverseIdRedirect );
	// More specific `:id/profile/:actor` route registered before the
	// generic `:id/:tab` so the actor segment takes precedence.
	readerPage(
		'/reader/fediverse/:id(\\d+)/profile/:actor',
		sidebar,
		fediverseAuthorProfile,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/fediverse/:id(\\d+)/profile/:actor/followers',
		sidebar,
		fediverseProfileFollowers,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/fediverse/:id(\\d+)/profile/:actor/following',
		sidebar,
		fediverseProfileFollowing,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/fediverse/:id(\\d+)/:tab',
		sidebar,
		fediverseAccount,
		makeLayout,
		clientRender
	);
}
