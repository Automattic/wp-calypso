import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

interface MigrationStickerMutationOptions {
	targetBlogId: SiteId;
}

export const useMigrationStickerMutation = () => {
	const mutation = useMutation( {
		mutationFn: ( { targetBlogId }: MigrationStickerMutationOptions ) =>
			wp.req.post( `/sites/${ targetBlogId }/migration-flow` ),
	} );

	const { mutate } = mutation;
	const addMigrationSticker = useCallback(
		( targetBlogId: SiteId ) => mutate( { targetBlogId } ),
		[ mutate ]
	);

	return { addMigrationSticker, ...mutation };
};
