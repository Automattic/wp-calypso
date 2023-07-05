import { uniqueBy } from '@automattic/js-utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { Member } from 'calypso/my-sites/people/types';

interface GetViewersParameters {
	siteId: number;
	number: number;
	page: number;
}

interface GetViewersResponse {
	found: number;
	viewers: Member[];
}

const extractPages = ( pages: GetViewersResponse[] ) => pages.flatMap( ( page ) => page.viewers );
const compareUnique = ( a: Member, b: Member ) => a.ID === b.ID;

const DEFAULT_PER_PAGE = 100;

const getViewers = ( {
	siteId,
	number,
	page = 1,
}: GetViewersParameters ): Promise< GetViewersResponse > =>
	wpcom.req.get( `/sites/${ siteId }/viewers`, { number, page } );

const useViewersQuery = (
	siteId: number,
	{ number = DEFAULT_PER_PAGE } = {},
	queryOptions = {}
) => {
	const { data, ...rest } = useInfiniteQuery(
		[ 'viewers', siteId ],
		( { pageParam = 1 } ) => getViewers( { siteId, number, page: pageParam } ),
		{
			...queryOptions,
			getNextPageParam: ( lastPage, allPages ) => {
				if ( lastPage.found <= allPages.length * number ) {
					return;
				}
				return allPages.length + 1;
			},
		}
	);

	return {
		data: {
			...data,
			viewers: uniqueBy( extractPages( data?.pages ?? [] ), compareUnique ),
			total: data?.pages[ 0 ].found,
		},
		...rest,
	};
};

export default useViewersQuery;
