import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, mcp } from 'calypso/me/controller';

export default function () {
	page( '/me/mcp', sidebar, mcp, makeLayout, clientRender );
}
