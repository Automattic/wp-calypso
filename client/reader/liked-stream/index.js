import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import { likes } from './controller';

export default function () {
	page( '/activities/likes', sidebar, likes, makeLayout, clientRender );

	// Catch-all for unrecognized /activities/* paths.
	page( '/activities/*', readerNotFound );
}
