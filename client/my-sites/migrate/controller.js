/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import SectionMigrate from 'my-sites/migrate/section-migrate';
import getSiteId from 'state/selectors/get-site-id';
import { isEnabled } from 'config';

export function migrateSite( context, next ) {
	if ( isEnabled( 'tools/migrate' ) ) {
		const sourceSiteId =
			context.params.sourceSiteId &&
			getSiteId( context.store.getState(), context.params.sourceSiteId );
		context.primary = <SectionMigrate sourceSiteId={ sourceSiteId } />;
		return next();
	}

	page.redirect( '/' );
}
