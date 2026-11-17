import { dashboardLink } from 'calypso/dashboard/utils/link';
import { goToMigrationFlow } from './utils';

// The source site in the URL is a site slug, or a site ID that only resolves through Redux.
function getFromSite( context ) {
	const { sourceSiteId } = context.params;
	const sourceSiteSlug =
		sourceSiteId && ! /^\d+$/.test( sourceSiteId )
			? sourceSiteId.replaceAll( '::', '/' )
			: undefined;

	return context.query[ 'from-site' ] ?? sourceSiteSlug;
}

// The migration overview sends a site that isn't migrating on to its overview.
export function redirectToMigrationOverview( context ) {
	window.location.replace(
		dashboardLink( `/sites/${ context.params.site_id }/migration-overview` )
	);
}

export function redirectToMigrationFlow( context ) {
	goToMigrationFlow( context.params.site_id, getFromSite( context ) );
}
