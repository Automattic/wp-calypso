import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { notifications } from './controller';

export default function () {
	// While this page is no longer shown via sidebar navigation, it is still in use as users with
	// 3PCs disabled are redirected to this when clicking the notification bell when outside
	// Calypso.
	page( '/reader/notifications', sidebar, notifications, makeLayout, clientRender );
}
