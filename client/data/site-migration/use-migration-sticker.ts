import config from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

interface MigrationStickerMutationOptions {
	targetBlogId: SiteId;
}

export const useMigrationStickerMutation = () => {
	const addMutation = useMutation( {
		mutationFn: ( { targetBlogId }: MigrationStickerMutationOptions ) =>
			wp.req.post( {
				path: `/sites/${ targetBlogId }/migration-flow`,
				apiNamespace: 'wpcom/v2',
			} ),
	} );

	const deleteMutation = useMutation( {
		mutationFn: ( { targetBlogId }: MigrationStickerMutationOptions ) => {
			return wp.req.post( {
				path: `/sites/${ targetBlogId }/migration-flow`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} );
		},
	} );

	const { mutate: addMutate, ...addMutationRest } = addMutation;
	const { mutate: deleteMutate, ...deleteMutationRest } = deleteMutation;

	const addMigrationSticker = useCallback(
		( targetBlogId: SiteId ) => addMutate( { targetBlogId } ),
		[ addMutate ]
	);

	const deleteMigrationSticker = useCallback(
		( targetBlogId: SiteId ) => {
			if ( ! config.isEnabled( 'migration-flow/introductory-offer' ) ) {
				return;
			}

			deleteMutate( { targetBlogId } );
		},
		[ deleteMutate ]
	);

	return {
		addMigrationSticker,
		deleteMigrationSticker,
		addMutationRest,
		deleteMutationRest,
	};
};
