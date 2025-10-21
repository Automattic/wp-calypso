import { getMigrationState } from 'calypso/data/site-migration';
import { MigrationInProgress } from './components/migration-in-progress';
import { MigrationPending } from './components/migration-pending';
import { MigrationStartedDIFM } from './components/migration-started-difm';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

const MigrationOverview = ( { site }: { site: SiteDetails } ) => {
	const state = getMigrationState( site?.site_migration );

	if ( state?.status === 'pending' ) {
		return <MigrationPending site={ site } />;
	}

	if ( state?.type === 'difm' ) {
		return <MigrationStartedDIFM site={ site } />;
	}

	return <MigrationInProgress site={ site } />;
};

export default MigrationOverview;
