import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { privacy } from './controller';

export default function () {
	page( '/me/privacy', sidebar, privacy, makeLayout, clientRender );
}
