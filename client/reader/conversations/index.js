import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { conversations, conversationsA8c } from './controller';

export default function () {
	page( '/reader/conversations', sidebar, conversations, makeLayout, clientRender );

	page( '/reader/conversations/a8c', sidebar, conversationsA8c, makeLayout, clientRender );
}
