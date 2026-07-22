import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { conversations, conversationsA8c } from './controller';

export default function () {
	readerPage( '/reader/conversations', sidebar, conversations, makeLayout, clientRender );

	readerPage( '/reader/conversations/a8c', sidebar, conversationsA8c, makeLayout, clientRender );
}
