import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { notifications } from './controller';

export default function () {
	page( '/read/notifications', updateLastRoute, sidebar, notifications, makeLayout, clientRender );
}
