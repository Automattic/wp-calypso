import config from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import { log } from './logger';
import type { SiteId } from 'calypso/types';

interface Result {
	status: 'success' | 'skipped';
	siteId?: SiteId;
}

interface Variables {
	siteId: SiteId;
}

const request = async ( { siteId }: Variables ): Promise< Result > => {
	if ( config.isEnabled( 'migration/track-pending-migrations' ) ) {
		//TODO: Call the API to cancel the migration
		return Promise.resolve( { status: 'success', siteId } );
	}

	return { status: 'skipped', siteId };
};

/**
 * Hook to cancel a pending migration.
 * @example
 * const { mutate: cancelMigration, isPending, isSuccess } = useMigrationCancelling();
 * cancelMigration( 123 );
 */
export const useMigrationCanceller = ( siteId?: SiteId ) =>
	useMutation< Result, Error, Variables >( {
		mutationFn: async ( { siteId } ) => {
			if ( siteId ) {
				return request( { siteId } );
			}

			return { status: 'skipped' };
		},
		mutationKey: [ 'migration-cancel', siteId ],
		onSuccess( data ) {
			log( {
				message: data.status === 'success' ? 'migration canceled' : 'migration cancel skipped',
				siteId,
				extra: {
					status: data.status,
				},
			} );
		},
		onError( error ) {
			log( {
				message: error.message ?? 'error to cancel migration',
				siteId,
				extra: {
					status: 'error',
				},
			} );
		},
	} );
