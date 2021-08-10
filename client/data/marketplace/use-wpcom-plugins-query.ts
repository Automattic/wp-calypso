import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface Options {
	enabled?: boolean;
	staleTime?: number;
	refetchOnMount?: boolean;
}

enum Type {
	all = 'all',
	featured = 'featured',
}

export const getCacheKey = ( type: string ): QueryKey => [ 'wpcom-plugins', type ];

const useWPCOMPlugins = (
	type: string,
	{ enabled = true, staleTime = 1000 * 60 * 60 * 24, refetchOnMount = false }: Options = {}
): UseQueryResult => {
	return useQuery( getCacheKey( type ), () => fetchWPCOMPlugins( type ), {
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

export function fetchWPCOMPlugins( type: string ) {
	const query = {
		type: type,
	};

	// return wpcom.req.get(
	// 	{
	// 		path: `wpcom-plugins`,
	// 		apiNamespace: 'wpcom/v2',
	// 	},
	// 	query
	// );
	return [
		{
			added: '2010-10-11',
			author: '<a href="https://yoa.st/1uk">Team Yoast</a>',
			author_profile: 'https://profiles.wordpress.org/joostdevalk',
			banners: { low: 'https://ps.w.org/wordpress-seo/assets/banner-772x250.png?rev=1843435' },
			compatibility: [],
			donate_link: 'https://yoa.st/1up',
			download_link: 'https://downloads.wordpress.org/plugin/wordpress-seo.16.8.zip',
			downloaded: 345240282,
			homepage: 'https://yoa.st/1uj',
			icons: { '1x': 'https://ps.w.org/wordpress-seo/assets/icon.svg?rev=2363699' },
			last_updated: '2021-07-27 6:55am GMT',
			name: 'Yoast SEO Premium',
			num_ratings: 27372,
			rating: 96,
			ratings: { 1: 717, 2: 123, 3: 170, 4: 616, 5: 25746 },
			requires_php: '5.6.20',
			screenshots: {
				1: { src: 'https://ps.w.org/wordpress-seo/assets/screenshot-1.png?rev=2363699' },
			},
			short_description:
				'Improve your WordPress SEO: Write better content and have a fully optimized WordPress site using the Yoast SEO plugin.',
			slug: 'wordpress-seo-premium',
			support_threads: 575,
			support_threads_resolved: 529,
			tags: {
				'content-analysis': 'Content analysis',
				readability: 'Readability',
				schema: 'schema',
				seo: 'seo',
			},
			version: '16.8',

			raw_price: 70,
			billed: 'annually',
		},
	];
}

export default useWPCOMPlugins;
