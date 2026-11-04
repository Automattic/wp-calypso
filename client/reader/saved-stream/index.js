import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { requireSavedPosts, saved } from './controller';

export default function () {
	readerPage( '/read/saved', requireSavedPosts, sidebar, saved, makeLayout, clientRender );
}
