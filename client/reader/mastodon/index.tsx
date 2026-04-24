import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import {
	mastodonLanding,
	mastodonConnect,
	mastodonIdRedirect,
	mastodonAccount,
} from './controller';

export default function () {
	page( '/reader/mastodon', sidebar, setBeforePrimary, mastodonLanding, makeLayout, clientRender );
	page(
		'/reader/mastodon/connect',
		sidebar,
		setBeforePrimary,
		mastodonConnect,
		makeLayout,
		clientRender
	);
	page( '/reader/mastodon/:id(\\d+)', mastodonIdRedirect );
	page(
		'/reader/mastodon/:id(\\d+)/:tab',
		sidebar,
		setBeforePrimary,
		mastodonAccount,
		makeLayout,
		clientRender
	);
}
