/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import SectionMigrate from 'my-sites/migrate/section-migrate';
import { isEnabled } from 'config';

export function migrateSite( context, next ) {
	if ( isEnabled( 'tools/migrate' ) ) {
		context.primary = <SectionMigrate />;
		return next();
	}

	page.redirect( '/' );
}
