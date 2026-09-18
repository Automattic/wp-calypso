import './style.scss';

import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { connectionsLanding, connectionsNew } from './controller';

export default function initConnections() {
	readerPage( '/reader/connections', sidebar, connectionsLanding, makeLayout, clientRender );
	readerPage( '/reader/connections/new', sidebar, connectionsNew, makeLayout, clientRender );
}
