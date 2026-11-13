import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import wpcom from 'calypso/lib/wp';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const MIGRATION_FLOW = '/setup/site-migration';

function goToMigrationFlow( siteSlug ) {
	window.location.replace(
		siteSlug ? addQueryArgs( MIGRATION_FLOW, { siteSlug } ) : MIGRATION_FLOW
	);
}

export function redirectToMigrationFlow( context ) {
	goToMigrationFlow( context.params.site );
}

/**
 * Clears a finished or failed legacy migration, which otherwise keeps wp-admin locked on Atomic
 * sites, and leaves a running one alone so its restore isn't interrupted.
 */
export async function closeLegacyMigration( context, next ) {
	const site = getSelectedSite( context.store.getState() );
	if ( ! site ) {
		goToMigrationFlow( context.params.site );
		return;
	}

	const status = await wpcom.req
		.get( { path: `/sites/${ site.ID }/migration-status`, apiNamespace: 'wpcom/v2' } )
		.then( ( response ) => response?.status )
		.catch( () => undefined );

	if ( [ 'new', 'backing-up', 'restoring' ].includes( status ) ) {
		context.primary = (
			<EmptyContent
				title={ translate( 'Your site is still being migrated' ) }
				line={ translate( 'Check back in a few minutes.' ) }
			/>
		);
		next();
		return;
	}

	if ( status === 'done' || status === 'error' ) {
		await wpcom.req
			.post( { path: `/sites/${ site.ID }/reset-migration`, apiNamespace: 'wpcom/v2' } )
			.catch( () => {} );
	}

	if ( status === 'done' ) {
		page.redirect( `/home/${ site.slug }` );
		return;
	}

	goToMigrationFlow( site.slug );
}
