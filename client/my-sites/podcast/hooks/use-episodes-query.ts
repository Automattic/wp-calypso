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

type EpisodeHeaders = {
	'X-WP-TotalPages'?: number | string;
};

const fetchEpisodePage = async (
	siteId: number,
	categoryId: number,
	pageNumber: number
): Promise< { data: EpisodePost[]; headers: EpisodeHeaders } > => {
	return new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path: `/sites/${ siteId }/posts`,
				apiNamespace: 'wp/v2',
			},
			{
				categories: String( categoryId ),
				per_page: 100,
				page: pageNumber,
				orderby: 'date',
				order: 'desc',
				_embed: 'wp:featuredmedia',
			},
			( error: Error | null, data: EpisodePost[] = [], headers: EpisodeHeaders = {} ) => {
				if ( error ) {
					return reject( error );
				}

				resolve( { data, headers } );
			}
		);
	} );
};

const useEpisodesQuery = ( { siteId, categoryId }: Params ) => {
	return useQuery< EpisodePost[] >( {
		queryKey: [ 'podcast-episodes', siteId, categoryId ],
		queryFn: async () => {
			if ( ! siteId || ! categoryId ) {
				return [];
			}

			const pages: EpisodePost[] = [];
			let pageNumber = 1;
			let totalPages = 1;

			do {
				const { data, headers } = await fetchEpisodePage( siteId, categoryId, pageNumber );
				pages.push( ...data );
				totalPages = Number( headers[ 'X-WP-TotalPages' ] || 1 );
				pageNumber += 1;
			} while ( pageNumber <= totalPages );

			return pages;
		},
		enabled: !! siteId && !! categoryId,
	} );
};

export default useEpisodesQuery;
