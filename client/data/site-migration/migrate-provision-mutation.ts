import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

interface MigrateProvisionMutationOptions {
	targetBlogId: SiteId;
	sourceBlogId: SiteId;
	checkMigrationPlugin: boolean;
}

export const useMigrateProvisionMutation = ( onSuccessCallback: () => void ) => {
	const mutation = useMutation( {
		mutationFn: ( {
			targetBlogId,
			sourceBlogId,
			checkMigrationPlugin,
		}: MigrateProvisionMutationOptions ) => {
			const path =
				`/sites/${ targetBlogId }/migrate-provision/${ sourceBlogId }` +
				( checkMigrationPlugin ? '?check_migration_plugin=true' : '' );
			return wp.req.post( {
				path,
				apiNamespace: 'wpcom/v2',
			} );
		},
		onSuccess: onSuccessCallback,
	} );

	const { mutate } = mutation;
	const migrateProvision = useCallback(
		( targetBlogId: number, sourceBlogId: number, checkMigrationPlugin: boolean ) =>
			mutate( { targetBlogId, sourceBlogId, checkMigrationPlugin } ),
		[ mutate ]
	);

	return { migrateProvision, ...mutation };
};
