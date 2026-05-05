import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import {
	fediverseAccount,
	fediverseConnect,
	fediverseIdRedirect,
	fediverseLanding,
	fediverseOauthCallback,
} from './controller';

export default function () {
	page(
		'/reader/fediverse',
		sidebar,
		setBeforePrimary,
		fediverseLanding,
		makeLayout,
		clientRender
	);
	page(
		'/reader/fediverse/connect',
		sidebar,
		setBeforePrimary,
		fediverseConnect,
		makeLayout,
		clientRender
	);
	page(
		'/reader/fediverse/oauth-callback',
		sidebar,
		setBeforePrimary,
		fediverseOauthCallback,
		makeLayout,
		clientRender
	);
	page( '/reader/fediverse/:id(\\d+)', fediverseIdRedirect );
	page(
		'/reader/fediverse/:id(\\d+)/:tab',
		sidebar,
		setBeforePrimary,
		fediverseAccount,
		makeLayout,
		clientRender
	);
}
