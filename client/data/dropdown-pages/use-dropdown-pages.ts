import { useQuery } from '@tanstack/react-query';
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
	return useQuery< DropdownPagesResponse, unknown, TData >( {
		queryKey: [ 'sites', siteId, 'dropdown-pages' ],
		queryFn: (): Promise< DropdownPagesResponse > =>
			wpcom.req.get( `/sites/${ siteId }/dropdown-pages` ),
		enabled: !! siteId,
		...queryOptions,
	} );
};

export default useDropdownPagesQuery;
