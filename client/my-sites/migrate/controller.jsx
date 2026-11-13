import { getSiteId } from 'calypso/state/sites/selectors';
import SectionMigrate from './section-migrate';
import { goToMigrationFlow } from './utils';

export function migrateSite( context, next ) {
	const sourceSiteId =
		context.params.sourceSiteId &&
		getSiteId( context.store.getState(), context.params.sourceSiteId );

	context.primary = <SectionMigrate sourceSiteId={ sourceSiteId } />;

	next();
}

export function redirectToMigrationFlow( context ) {
	goToMigrationFlow( context.params.site_id );
}
