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

export function ensureFeatureFlag( context, next ) {
	if ( isEnabled( 'tools/migrate' ) ) {
		return next();
	}
	page.redirect( '/' );
}

export function migrateSite( context, next ) {
	if ( isEnabled( 'tools/migrate' ) ) {
		const sourceSiteId =
			context.params.sourceSiteId &&
			getSiteId( context.store.getState(), context.params.sourceSiteId );
		context.primary = (
			<SectionMigrate sourceSiteId={ sourceSiteId } step={ context.migrationStep } />
		);
		return next();
	}

	page.redirect( '/' );
}

export function setStep( migrationStep ) {
	return ( context, next ) => {
		context.migrationStep = migrationStep;
		next();
	};
}

export function setSiteSelectionHeader( context, next ) {
	context.getSiteSelectionHeaderText = () => 'Select a site to import into';
	next();
}
