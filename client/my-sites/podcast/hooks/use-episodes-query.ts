import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type EpisodePost = {
	id: number;
	title: { rendered: string };
	date: string;
	status: string;
	link: string;
	featured_media: number;
	_embedded?: {
		'wp:featuredmedia'?: Array< {
			source_url?: string;
			media_details?: {
				sizes?: Record< string, { source_url?: string } >;
			};
		} >;
	};
};

type Params = {
	siteId: number | null | undefined;
	categoryId: number;
};

const useEpisodesQuery = ( { siteId, categoryId }: Params ) => {
	return useQuery< EpisodePost[] >( {
		queryKey: [ 'podcast-episodes', siteId, categoryId ],
		queryFn: () => {
			const params = new URLSearchParams( {
				categories: String( categoryId ),
				per_page: '50',
				orderby: 'date',
				order: 'desc',
				_embed: 'wp:featuredmedia',
			} );
			return wpcom.req.get( {
				path: `/sites/${ siteId }/posts?${ params.toString() }`,
				apiNamespace: 'wp/v2',
			} );
		},
		enabled: !! siteId && !! categoryId,
	} );
};

export default useEpisodesQuery;
