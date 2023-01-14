import { useQuery, UseQueryOptions } from 'react-query';
import wpcom from 'calypso/lib/wp';

type Response = PageNode[];

export type PageNode = {
	ID: number;
	title: string;
	children?: PageNode[];
};

type QueryOptions = Omit<
	UseQueryOptions< Response, unknown, Response, ( string | number | undefined )[] >,
	'queryKey' | 'queryFn'
>;

const useDropdownPagesQuery = ( siteId?: number, queryOptions: QueryOptions = {} ) => {
	return useQuery(
		[ 'sites', siteId, 'dropdown-pages' ],
		(): Promise< Response > => wpcom.req.get( `/sites/${ siteId }/dropdown-pages` ),
		{
			enabled: !! siteId,
			...queryOptions,
		}
	);
};

export default useDropdownPagesQuery;
