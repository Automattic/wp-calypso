import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import {
	atmosphereLanding,
	atmosphereConnect,
	atmosphereIdRedirect,
	atmosphereProfile,
	atmosphereProfileFollowers,
	atmosphereProfileFollowing,
	atmosphereTagFeed,
	atmosphereThread,
	atmosphereAccount,
} from './controller';

export default function () {
	page( '/reader/atmosphere', sidebar, atmosphereLanding, makeLayout, clientRender );
	page( '/reader/atmosphere/connect', sidebar, atmosphereConnect, makeLayout, clientRender );
	page( '/reader/atmosphere/:id(\\d+)', atmosphereIdRedirect );
	page(
		'/reader/atmosphere/:id(\\d+)/thread/:did/:rkey',
		sidebar,
		atmosphereThread,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/profile/:actor',
		sidebar,
		atmosphereProfile,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/profile/:actor/followers',
		sidebar,
		atmosphereProfileFollowers,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/profile/:actor/following',
		sidebar,
		atmosphereProfileFollowing,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/tag/:hashtag',
		sidebar,
		atmosphereTagFeed,
		makeLayout,
		clientRender
	);
	page( '/reader/atmosphere/:id(\\d+)/:tab', sidebar, atmosphereAccount, makeLayout, clientRender );
}
