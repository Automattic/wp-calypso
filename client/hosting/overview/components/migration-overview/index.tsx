import { getMigrationStatus, getMigrationType } from 'calypso/sites-dashboard/utils';
import { MigrationPending } from './components/migration-pending';
import { MigrationStartedDIFM } from './components/migration-started-difm';
import { MigrationStartedDIY } from './components/migration-started-diy';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

const MigrationOverview = ( { site }: { site: SiteDetails } ) => {
	const migrationType = getMigrationType( site );
	const migrationStatus = getMigrationStatus( site );
	const isPending = 'pending' === migrationStatus;

	let component;

	if ( isPending ) {
		component = <MigrationPending site={ site } />;
	} else if ( migrationType === 'difm' ) {
		component = <MigrationStartedDIFM site={ site } />;
	} else if ( migrationType === 'diy' ) {
		component = <MigrationStartedDIY site={ site } />;
	}

	return <div className="migration-overview">{ component }</div>;
};

export default MigrationOverview;
