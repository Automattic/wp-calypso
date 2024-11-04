import { useEffect } from 'react';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/use-update-migration-status';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { type SiteId } from 'calypso/types';

const useMarkPendingMigration = ( siteId?: SiteId ) => {
	const { mutate: updateMigrationStatus, isSuccess } = useUpdateMigrationStatus();

	useEffect( () => {
		if ( siteId ) {
			updateMigrationStatus( { siteId, statusSticker: 'migration-pending' } );
		}
	}, [ siteId, updateMigrationStatus ] );
	return { isSuccess };
};

const useSetPendingMigration = () => {
	const site = useSite();
	const siteId = site?.ID;

	useMarkPendingMigration( siteId );

	const { mutate: updateMigrationStatus, isPending, isSuccess } = useUpdateMigrationStatus();

	const setPendingMigration = ( how: string ) => {
		if ( siteId ) {
			const parsedHow = how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ? 'diy' : how;
			updateMigrationStatus( { siteId, statusSticker: `migration-pending-${ parsedHow }` } );
		}
	};

	return { mutate: setPendingMigration, isPending, isSuccess };
};

export default useSetPendingMigration;
