import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
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
	page(
		'/reader/atmosphere',
		sidebar,
		setBeforePrimary,
		atmosphereLanding,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/connect',
		sidebar,
		setBeforePrimary,
		atmosphereConnect,
		makeLayout,
		clientRender
	);
	page( '/reader/atmosphere/:id(\\d+)', atmosphereIdRedirect );
	page(
		'/reader/atmosphere/:id(\\d+)/thread/:did/:rkey',
		sidebar,
		setBeforePrimary,
		atmosphereThread,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/profile/:actor',
		sidebar,
		setBeforePrimary,
		atmosphereProfile,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/profile/:actor/followers',
		sidebar,
		setBeforePrimary,
		atmosphereProfileFollowers,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/profile/:actor/following',
		sidebar,
		setBeforePrimary,
		atmosphereProfileFollowing,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/tag/:hashtag',
		sidebar,
		setBeforePrimary,
		atmosphereTagFeed,
		makeLayout,
		clientRender
	);
	page(
		'/reader/atmosphere/:id(\\d+)/:tab',
		sidebar,
		setBeforePrimary,
		atmosphereAccount,
		makeLayout,
		clientRender
	);
}
