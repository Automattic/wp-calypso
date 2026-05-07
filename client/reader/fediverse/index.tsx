import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import {
	fediverseAccount,
	fediverseAuthorProfile,
	fediverseIdRedirect,
	fediverseLanding,
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
	page( '/reader/fediverse/:id(\\d+)', fediverseIdRedirect );
	// More specific `:id/profile/:actor` route registered before the
	// generic `:id/:tab` so the actor segment takes precedence.
	page(
		'/reader/fediverse/:id(\\d+)/profile/:actor',
		sidebar,
		setBeforePrimary,
		fediverseAuthorProfile,
		makeLayout,
		clientRender
	);
	page(
		'/reader/fediverse/:id(\\d+)/:tab',
		sidebar,
		setBeforePrimary,
		fediverseAccount,
		makeLayout,
		clientRender
	);
}
