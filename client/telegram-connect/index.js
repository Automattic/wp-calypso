import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { telegramConnect } from './controller';

export default function () {
	page( '/telegram-connect', telegramConnect, makeLayout, clientRender );
}
