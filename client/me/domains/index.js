import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { domains } from './controller';

export default function () {
	page( '/me/domains', sidebar, domains, makeLayout, clientRender );
}
