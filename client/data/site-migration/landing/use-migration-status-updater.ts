import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import { log } from './logger';
import { MigrationStatus } from './types';

const request = ( { siteId, status }: { siteId: SiteId; status: MigrationStatus } ) =>
	wp.req.post( {
		path: `/sites/${ siteId }/site-migration-status-sticker`,
		apiNamespace: 'wpcom/v2',
		body: {
			status_sticker: status,
		},
	} );

interface Response {
	success: boolean;
}

interface Variables {
	status: MigrationStatus;
}

export const useMigrationStatusUpdater = ( siteId: SiteId | undefined | null ) => {
	return useMutation< Response, Error, Variables >( {
		mutationKey: [ 'migration-status', siteId ],
		mutationFn: ( { status } ) => {
			if ( ! siteId ) {
				throw new Error( 'Site ID is required' );
			}
			return request( { siteId, status } );
		},
		onSuccess: () => {
			log( {
				message: 'Migration status updated',
				siteId: siteId,
			} );
		},
		onError: ( error ) => {
			log( {
				message: 'Error updating migration status',
				siteId,
				extra: {
					error: error.message,
				},
			} );
		},
	} );
};
