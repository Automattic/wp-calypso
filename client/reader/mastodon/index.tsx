import './style.scss';

import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import {
	mastodonLanding,
	mastodonConnect,
	mastodonIdRedirect,
	mastodonAccount,
	mastodonOauthCallback,
	mastodonProfile,
	mastodonProfileFollowers,
	mastodonProfileFollowing,
	mastodonTagFeed,
	mastodonThread,
} from './controller';

export default function () {
	readerPage( '/reader/mastodon', sidebar, mastodonLanding, makeLayout, clientRender );
	readerPage( '/reader/mastodon/connect', sidebar, mastodonConnect, makeLayout, clientRender );
	readerPage(
		'/reader/mastodon/oauth-callback',
		sidebar,
		mastodonOauthCallback,
		makeLayout,
		clientRender
	);
	readerPage( '/reader/mastodon/:id(\\d+)', mastodonIdRedirect );
	readerPage(
		'/reader/mastodon/:id(\\d+)/thread/:status_id',
		sidebar,
		mastodonThread,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/mastodon/:id(\\d+)/profile/:actor',
		sidebar,
		mastodonProfile,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/mastodon/:id(\\d+)/profile/:actor/followers',
		sidebar,
		mastodonProfileFollowers,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/mastodon/:id(\\d+)/profile/:actor/following',
		sidebar,
		mastodonProfileFollowing,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/mastodon/:id(\\d+)/tag/:hashtag',
		sidebar,
		mastodonTagFeed,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/mastodon/:id(\\d+)/:tab',
		sidebar,
		mastodonAccount,
		makeLayout,
		clientRender
	);
}
