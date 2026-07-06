import { fetchAgencyTipaltiPayee } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const agencyTipaltiPayeeQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'tipalti', 'payee' ],
		queryFn: () => fetchAgencyTipaltiPayee( agencyId ),
	} );
