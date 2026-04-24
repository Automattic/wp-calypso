import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import {
	atmosphereLanding,
	atmosphereConnect,
	atmosphereIdRedirect,
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
		'/reader/atmosphere/:id(\\d+)/:tab',
		sidebar,
		setBeforePrimary,
		atmosphereAccount,
		makeLayout,
		clientRender
	);
}
