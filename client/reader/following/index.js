/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { followingManage } from './controller';
import { initAbTests, makeLayout, updateLastRoute, sidebar } from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_FOLLOWING_DEFINITION } from 'reader';

export default function() {
	page( '/following/*', initAbTests );
	page(
		'/following/manage',
		updateLastRoute,
		sidebar,
		setSection( READER_FOLLOWING_DEFINITION ),
		followingManage,
		makeLayout,
		clientRender
	);
	page( '/following/edit*', '/following/manage' );
}
