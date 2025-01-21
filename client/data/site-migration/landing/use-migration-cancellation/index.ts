import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import { log } from '../logger';

const request = async ( { siteId }: { siteId: SiteId } ): Promise< Response > => {
	await wp.req.post( {
		path: `/sites/${ siteId }/site-migration-status-sticker`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
		body: {
			type: 'pending',
		},
	} );

	return { status: 'success' };
};

interface Response {
	status: 'success' | 'skipped';
}

export const useMigrationCancellation = ( siteId: SiteId | undefined ) => {
	return useMutation< Response, Error >( {
		mutationKey: [ 'migration-cancellation', siteId ],
		mutationFn: () => {
			if ( ! siteId ) {
				throw new Error( 'Site ID is required' );
			}

			return request( { siteId } );
		},
		onError: ( error ) => {
			log( {
				message: 'Error cancelling the migration',
				siteId,
				extra: {
					error: error.message,
				},
			} );
		},
	} );
};
