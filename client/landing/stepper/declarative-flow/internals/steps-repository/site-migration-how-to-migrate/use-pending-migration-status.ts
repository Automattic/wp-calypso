import { useEffect } from 'react';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/use-update-migration-status';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import type { NavigationControls } from '../../types';

interface PendingMigrationStatusProps {
	onSubmit?: Pick< NavigationControls, 'submit' >[ 'submit' ];
}

const usePendingMigrationStatus = ( { onSubmit }: PendingMigrationStatusProps ) => {
	const site = useSite();
	const siteId = site?.ID;

	const canInstallPlugins = site?.plan?.features?.active.find(
		( feature ) => feature === 'install-plugins'
	)
		? true
		: false;

	const { updateMigrationStatus } = useUpdateMigrationStatus();

	// Register pending migration status when loading the step.
	useEffect( () => {
		if ( siteId ) {
			updateMigrationStatus( siteId, 'migration-pending' );
		}
	}, [ siteId, updateMigrationStatus ] );

	const setPendingMigration = ( how: string ) => {
		const destination = canInstallPlugins ? 'migrate' : 'upgrade';
		if ( siteId ) {
			const parsedHow = how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ? 'diy' : how;
			updateMigrationStatus( siteId, `migration-pending-${ parsedHow }` );
		}

		if ( onSubmit ) {
			return onSubmit( { how, destination } );
		}
	};

	return { setPendingMigration };
};

export default usePendingMigrationStatus;
