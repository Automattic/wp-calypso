import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { account } from './controller';

export default function () {
	page( '/me/account', sidebar, account, makeLayout, clientRender );
}
