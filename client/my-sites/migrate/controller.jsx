import { getSiteId } from 'calypso/state/sites/selectors';
import SectionMigrate from './section-migrate';
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

export function migrateSite( context, next ) {
	const sourceSiteId =
		context.params.sourceSiteId &&
		getSiteId( context.store.getState(), context.params.sourceSiteId );

	context.primary = (
		<SectionMigrate sourceSiteId={ sourceSiteId } fromSite={ getFromSite( context ) } />
	);

	next();
}

export function redirectToMigrationFlow( context ) {
	goToMigrationFlow( context.params.site_id, getFromSite( context ) );
}
