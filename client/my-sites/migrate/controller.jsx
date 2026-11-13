import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import wpcom from 'calypso/lib/wp';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const MIGRATION_FLOW = '/setup/site-migration';
const RUNNING_STATUSES = [ 'new', 'backing-up', 'backing-up-queued', 'restoring', 'in-progress' ];

function goToMigrationFlow( siteSlug ) {
	window.location.replace(
		siteSlug ? addQueryArgs( MIGRATION_FLOW, { siteSlug } ) : MIGRATION_FLOW
	);
}

export function redirectToMigrationFlow( context ) {
	goToMigrationFlow( context.params.site );
}

function showNotice( context, next, { title, line, action, onAction } ) {
	context.primary = (
		<EmptyContent title={ title } line={ line } action={ action } actionCallback={ onAction } />
	);
	next();
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

	let status;
	try {
		const response = await wpcom.req.get( {
			path: `/sites/${ site.ID }/migration-status`,
			apiNamespace: 'wpcom/v2',
		} );
		status = response?.status;
	} catch {
		// Not treated as `error`: resetting on a transient failure could cut a running restore short.
		showNotice( context, next, {
			title: translate( 'We couldn’t check your site’s migration' ),
			action: translate( 'Try again' ),
			onAction: () => window.location.reload(),
		} );
		return;
	}

	if ( RUNNING_STATUSES.includes( status ) ) {
		showNotice( context, next, {
			title: translate( 'Your site is still being migrated' ),
			line: translate( 'This can take a while.' ),
			action: translate( 'Check again' ),
			// Home, not a reload: a migration that ended as `inactive` is finished too, and the
			// classic-page lock sends a still-running one back here.
			onAction: () => window.location.replace( `/home/${ site.slug }` ),
		} );
		return;
	}

	if ( status === 'done' || status === 'error' ) {
		await wpcom.req
			.post( { path: `/sites/${ site.ID }/reset-migration`, apiNamespace: 'wpcom/v2' } )
			.catch( () => {} );
	}

	if ( status === 'done' ) {
		// A full load, so the classic-page lock reads the reset status rather than the stale one in Redux.
		window.location.replace( `/home/${ site.slug }` );
		return;
	}

	goToMigrationFlow( site.slug );
}
