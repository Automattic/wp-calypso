import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type DropdownPagesResponse = {
	found: number;
	dropdown_pages: PageNode[];
};

export type PageNode = {
	ID: number;
	title: string;
	children?: PageNode[];
};

const useDropdownPagesQuery = < TData = DropdownPagesResponse >(
	siteId?: number,
	queryOptions = {}
) => {
	return useQuery< DropdownPagesResponse, unknown, TData >(
		[ 'sites', siteId, 'dropdown-pages' ],
		(): Promise< DropdownPagesResponse > => wpcom.req.get( `/sites/${ siteId }/dropdown-pages` ),
		{
			enabled: !! siteId,
			...queryOptions,
		}
	);
};

export default useDropdownPagesQuery;
