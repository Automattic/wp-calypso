import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface Options {
	enabled?: boolean;
	staleTime?: number;
	refetchOnMount?: boolean;
}

type Type = 'all' | 'featured';

export const getCacheKey = ( type: Type ): QueryKey => [ 'wpcom-plugins', type ];

const useWPCOMPlugins = (
	type: Type,
	{ enabled = true, staleTime = 1000 * 60 * 60 * 24, refetchOnMount = false }: Options = {}
): UseQueryResult => {
	return useQuery( getCacheKey( type ), () => fetchWPCOMPlugins( type ), {
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

export function fetchWPCOMPlugins( type: Type ) {
	const query = {
		type: type,
	};

	// return wpcom.req.get(
	// 	{
	// 		path: `marketplace/plugins`,
	// 		apiNamespace: 'wpcom/v2',
	// 	},
	// 	query
	// );
	return [
		{
			author: '<a href="https://yoast.com/">Team Yoast</a>',
			author_name: 'Team Yoast',
			author_url: 'https://yoast.com/',
			icon: 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png?rev=1550389',
			name: 'Yoast SEO',
			rating: 98,
			slug: 'wordpress-seo',

			raw_price: 70,
			billed: 'annually',
		},
		{
			author: '<a href="https://yoast.com/">Team Yoast</a>',
			author_name: 'Team Yoast',
			author_url: 'https://yoast.com/',
			icon: 'https://ps.w.org/wordpress-seo/assets/icon-256x256.png?rev=1550389',
			name: 'Yoast SEO',
			rating: 98,
			slug: 'wordpress-seo',

			raw_price: 70,
			billed: 'annually',
		},
	];
}

export default useWPCOMPlugins;
