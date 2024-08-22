import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { Member } from '../../users/types';
import useQueryKeysFactory from './lib/use-query-keys-factory';

export function getUseSiteUserQueryOptions(
	siteId: number | null | undefined,
	userId: number | undefined,
	queryKey: ( string | number | null | undefined )[]
) {
	return {
		queryKey,
		queryFn: async (): Promise< Member > =>
			wpcomRequest( { path: `/sites/${ siteId }/users/${ userId }`, apiVersion: '1.1' } ),
		enabled: !! ( siteId && userId ),
	};
}

const useSiteUserQuery = ( siteId?: number | null, userId?: number ) => {
	const queryKeys = useQueryKeysFactory();
	return useQuery< Member >(
		getUseSiteUserQueryOptions( siteId, userId, queryKeys.siteUser( siteId, userId ) )
	);
};

export default useSiteUserQuery;
