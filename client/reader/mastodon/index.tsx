import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
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
	page( '/reader/mastodon', sidebar, mastodonLanding, makeLayout, clientRender );
	page( '/reader/mastodon/connect', sidebar, mastodonConnect, makeLayout, clientRender );
	page(
		'/reader/mastodon/oauth-callback',
		sidebar,
		mastodonOauthCallback,
		makeLayout,
		clientRender
	);
	page( '/reader/mastodon/:id(\\d+)', mastodonIdRedirect );
	page(
		'/reader/mastodon/:id(\\d+)/thread/:status_id',
		sidebar,
		mastodonThread,
		makeLayout,
		clientRender
	);
	page(
		'/reader/mastodon/:id(\\d+)/profile/:actor',
		sidebar,
		mastodonProfile,
		makeLayout,
		clientRender
	);
	page(
		'/reader/mastodon/:id(\\d+)/profile/:actor/followers',
		sidebar,
		mastodonProfileFollowers,
		makeLayout,
		clientRender
	);
	page(
		'/reader/mastodon/:id(\\d+)/profile/:actor/following',
		sidebar,
		mastodonProfileFollowing,
		makeLayout,
		clientRender
	);
	page(
		'/reader/mastodon/:id(\\d+)/tag/:hashtag',
		sidebar,
		mastodonTagFeed,
		makeLayout,
		clientRender
	);
	page( '/reader/mastodon/:id(\\d+)/:tab', sidebar, mastodonAccount, makeLayout, clientRender );
}
