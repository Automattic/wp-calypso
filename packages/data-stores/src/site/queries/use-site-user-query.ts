import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { Member } from '../../users/types';
import useQueryKeysFactory from './lib/use-query-keys-factory';

const useSiteUserQuery = ( siteId?: number | null, userId?: number, queryOptions = {} ) => {
	const queryKeys = useQueryKeysFactory();
	return useQuery< Member >( {
		queryKey: queryKeys.siteUser( siteId, userId ),
		queryFn: async () =>
			wpcomRequest( { path: `/sites/${ siteId }/users/${ userId }`, apiVersion: '1.1' } ),
		enabled: !! ( siteId && userId ),
		...queryOptions,
	} );
};

export default useSiteUserQuery;
