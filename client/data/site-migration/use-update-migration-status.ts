import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

export const setMigrationStatus = async ( siteId: SiteId, statusSticker: string ) => {
	wp.req.post( {
		path: `/sites/${ siteId }/site-migration-status-sticker`,
		apiNamespace: 'wpcom/v2',
		body: {
			status_sticker: statusSticker,
		},
	} );
	return { status: statusSticker };
};

export const useUpdateMigrationStatus = () => {
	return useMutation( {
		mutationFn: ( { siteId, statusSticker }: { siteId: SiteId; statusSticker: string } ) =>
			setMigrationStatus( siteId, statusSticker ),
	} );
};
