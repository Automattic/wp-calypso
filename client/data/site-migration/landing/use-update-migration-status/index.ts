import { isEnabled } from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import { log } from '../logger';
import { MigrationStatus } from '../types';

const shouldSkipStatus = ( status: MigrationStatus ) => {
	const isPendingStatusEnabled = isEnabled( 'automated-migration/pending-status' );
	const isPendingStatus = status.includes( 'pending' );

	return isPendingStatus && ! isPendingStatusEnabled;
};

const request = async ( {
	siteId,
	status,
}: {
	siteId: SiteId;
	status: MigrationStatus;
} ): Promise< Response > => {
	if ( shouldSkipStatus( status ) ) {
		return { status: 'skipped' };
	}

	await wp.req.post( {
		path: `/sites/${ siteId }/site-migration-status-sticker`,
		apiNamespace: 'wpcom/v2',
		body: {
			status_sticker: status,
		},
	} );

	return { status: 'success' };
};

interface Response {
	status: 'success' | 'skipped';
}

interface Variables {
	status: MigrationStatus;
}

export const useUpdateMigrationStatus = ( siteId: SiteId | undefined ) => {
	return useMutation< Response, Error, Variables >( {
		mutationKey: [ 'migration-status', siteId ],
		mutationFn: ( { status } ) => {
			if ( ! siteId ) {
				throw new Error( 'Site ID is required' );
			}

			return request( { siteId, status } );
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
