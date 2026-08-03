import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { notifications } from './controller';

export default function () {
	// While this page is no longer shown via sidebar navigation, it is still in use as users with
	// 3PCs disabled are redirected to this when clicking the notification bell when outside
	// Calypso.
	readerPage( '/reader/notifications', sidebar, notifications, makeLayout, clientRender );
}
