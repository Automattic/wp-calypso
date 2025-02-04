import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { developer } from './controller';

export default function () {
	page( '/me/developer', sidebar, developer, makeLayout, clientRender );
}
