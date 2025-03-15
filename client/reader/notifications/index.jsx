import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { notifications } from './controller';

export default function () {
	page( '/reader/notifications', sidebar, notifications, makeLayout, clientRender );
}
