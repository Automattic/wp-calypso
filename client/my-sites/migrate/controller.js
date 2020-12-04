/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';
/**
 * Internal Dependencies
 */
import SectionMigrate from 'calypso/my-sites/migrate/section-migrate';
import getSiteId from 'calypso/state/selectors/get-site-id';
import { isEnabled } from 'calypso/config';

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
	context.getSiteSelectionHeaderText = () => translate( 'Select a site to import into' );
	next();
}
