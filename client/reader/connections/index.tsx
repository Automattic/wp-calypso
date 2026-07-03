import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { connectionsLanding, connectionsNew } from './controller';

export default function initConnections() {
	page( '/reader/connections', sidebar, connectionsLanding, makeLayout, clientRender );
	page( '/reader/connections/new', sidebar, connectionsNew, makeLayout, clientRender );
}
