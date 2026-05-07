import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { fediverseAccount, fediverseIdRedirect, fediverseLanding } from './controller';

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
	page(
		'/reader/fediverse/:id(\\d+)/:tab',
		sidebar,
		setBeforePrimary,
		fediverseAccount,
		makeLayout,
		clientRender
	);
}
