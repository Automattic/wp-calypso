import { isEnabled } from '@automattic/calypso-config';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { requireSavedPosts, saved } from './controller';

export default function () {
	if ( isEnabled( 'reader/saved-posts' ) ) {
		readerPage( '/read/saved', sidebar, requireSavedPosts, saved, makeLayout, clientRender );
	}
}
