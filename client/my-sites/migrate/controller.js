/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import SectionMigrate from 'my-sites/migrate/section-migrate';

export function migrateSite( context, next ) {
	context.primary = <SectionMigrate />;
	next();
}
