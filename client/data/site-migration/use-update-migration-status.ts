import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

interface MigrationStatusMutationOptions {
	targetBlogId: SiteId;
	statusSticker: string;
}

export const useUpdateMigrationStatus = () => {
	const updateStatusMutation = useMutation( {
		mutationFn: ( { targetBlogId, statusSticker }: MigrationStatusMutationOptions ) =>
			wp.req.post( {
				path: `/sites/${ targetBlogId }/site-migration-status-sticker`,
				apiNamespace: 'wpcom/v2',
				body: {
					status_sticker: statusSticker,
				},
			} ),
	} );

	const {
		mutate: updateMigrationStatusMutate,
		mutateAsync: updateMigrationStatusMutateAsync,
		...updateStatusMutationRest
	} = updateStatusMutation;

	const updateMigrationStatus = useCallback(
		( targetBlogId: SiteId, statusSticker: string ) =>
			updateMigrationStatusMutate( { targetBlogId, statusSticker } ),
		[ updateMigrationStatusMutate ]
	);

	const updateMigrationStatusAsync = useCallback(
		( targetBlogId: SiteId, statusSticker: string ) =>
			updateMigrationStatusMutateAsync( { targetBlogId, statusSticker } ),
		[ updateMigrationStatusMutateAsync ]
	);

	return { updateMigrationStatus, updateMigrationStatusAsync, updateStatusMutationRest };
};
