import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { notifications } from './controller';

export default function () {
	page(
		'/reader/notifications',
		updateLastRoute,
		sidebar,
		notifications,
		makeLayout,
		clientRender
	);
}
