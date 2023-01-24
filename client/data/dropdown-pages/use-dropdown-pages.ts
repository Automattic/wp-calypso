import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

type Response = PageNode[];

export type PageNode = {
	ID: number;
	title: string;
	children?: PageNode[];
};

const useDropdownPagesQuery = ( siteId?: number, queryOptions = {} ) => {
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
