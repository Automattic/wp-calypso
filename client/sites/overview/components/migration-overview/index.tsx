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

	if ( isPending ) {
		return <MigrationPending site={ site } />;
	}

	if ( migrationType === 'difm' ) {
		return <MigrationStartedDIFM />;
	}

	if ( migrationType === 'diy' ) {
		return <MigrationStartedDIY site={ site } />;
	}
};

export default MigrationOverview;
