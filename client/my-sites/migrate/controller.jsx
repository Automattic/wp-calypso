import { translate } from 'i18n-calypso';
import { getSiteId } from 'calypso/state/sites/selectors';
import SectionMigrate from './section-migrate';

export function migrateSite( context, next ) {
	const sourceSiteId =
		context.params.sourceSiteId &&
		getSiteId( context.store.getState(), context.params.sourceSiteId );
	const fromSite = context.query[ 'from-site' ];

	context.primary = (
		<SectionMigrate sourceSiteId={ sourceSiteId } step={ context.migrationStep } url={ fromSite } />
	);

	next();
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
