import { wpcom } from '../wpcom-fetcher';
import type { TipaltiPayee } from './types';

export async function fetchAgencyTipaltiPayee( agencyId: number ): Promise< TipaltiPayee > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/tipalti`,
	} );
}
