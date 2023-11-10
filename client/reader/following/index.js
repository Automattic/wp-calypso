import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { updateLastRoute, sidebar } from 'calypso/reader/controller';
import { followingManage } from './controller';

export default function () {
	page( '/following/manage', updateLastRoute, sidebar, followingManage, makeLayout, clientRender );
	page( '/following/edit*', '/following/manage' );

	// Send /following to Reader root
	page( '/following', '/read' );
}
