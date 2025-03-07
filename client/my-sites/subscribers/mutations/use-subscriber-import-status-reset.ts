import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useSubscriberImportStatusReset = ( siteId: number | null ) => {
	return useMutation( {
		mutationFn: () => {
			if ( ! siteId ) {
				return Promise.resolve();
			}

			return wpcom.req.post( {
				path: `/sites/${ siteId }/subscribers/import/reset_state`,
				apiNamespace: 'wpcom/v2',
			} );
		},
	} );
};

export default useSubscriberImportStatusReset;
