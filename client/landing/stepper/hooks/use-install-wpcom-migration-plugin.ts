import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const useInstallWPCOMMigrationPlugin = ( siteId: number ) => {
	return useMutation< Response, Error >( {
		mutationKey: [ 'install-wpcom-migration-plugin', siteId ],
		mutationFn: () => {
			return wpcom.req.post( {
				path: `/sites/${ siteId }/plugins/wpcom-migration/install`,
				apiNamespace: 'rest/v1.2',
			} );
		},
	} );
};

export const useActivateWPCOMMigrationPlugin = ( siteId: number ) => {
	return useMutation< Response, Error >( {
		mutationKey: [ 'activate-wpcom-migration-plugin', siteId ],
		mutationFn: () => {
			return wpcom.req.post( {
				path: `/sites/${ siteId }/plugins/wpcom-migration%2fwpcom_migration`,
				apiNamespace: 'rest/v1.2',
				body: {
					active: true,
				},
			} );
		},
	} );
};
