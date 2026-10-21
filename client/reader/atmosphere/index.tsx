import './style.scss';

import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
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
	readerPage( '/reader/atmosphere', sidebar, atmosphereLanding, makeLayout, clientRender );
	readerPage( '/reader/atmosphere/connect', sidebar, atmosphereConnect, makeLayout, clientRender );
	readerPage( '/reader/atmosphere/:id(\\d+)', atmosphereIdRedirect );
	readerPage(
		'/reader/atmosphere/:id(\\d+)/thread/:did/:rkey',
		sidebar,
		atmosphereThread,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/atmosphere/:id(\\d+)/profile/:actor',
		sidebar,
		atmosphereProfile,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/atmosphere/:id(\\d+)/profile/:actor/followers',
		sidebar,
		atmosphereProfileFollowers,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/atmosphere/:id(\\d+)/profile/:actor/following',
		sidebar,
		atmosphereProfileFollowing,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/atmosphere/:id(\\d+)/tag/:hashtag',
		sidebar,
		atmosphereTagFeed,
		makeLayout,
		clientRender
	);
	readerPage(
		'/reader/atmosphere/:id(\\d+)/:tab',
		sidebar,
		atmosphereAccount,
		makeLayout,
		clientRender
	);
}
