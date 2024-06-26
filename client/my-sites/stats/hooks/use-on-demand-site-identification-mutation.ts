import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export function runOnDemandCommercialClassification( siteId: number | null ): Promise< any > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/commercial-classification`,
	} );
}

export default function useOnDemandCommercialClassificationMutation( siteId: number | null ) {
	return useMutation( {
		mutationKey: [ 'stats', 'commercial-classification', siteId ],
		mutationFn: () => runOnDemandCommercialClassification( siteId ),
		retry: 0,
	} );
}
