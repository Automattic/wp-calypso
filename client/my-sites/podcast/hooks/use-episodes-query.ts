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

export type EpisodesPage = {
	posts: EpisodePost[];
	totalItems: number;
	totalPages: number;
};

export type EpisodesOrderBy = 'date' | 'title';
export type EpisodesOrder = 'asc' | 'desc';

type Params = {
	siteId: number | null | undefined;
	categoryId: number;
	page: number;
	perPage: number;
	orderBy: EpisodesOrderBy;
	order: EpisodesOrder;
	search: string;
	status: string;
};

type EpisodeHeaders = {
	'X-WP-Total'?: number | string;
	'X-WP-TotalPages'?: number | string;
};

const fetchEpisodesPage = (
	siteId: number,
	categoryId: number,
	{ page, perPage, orderBy, order, search, status }: Omit< Params, 'siteId' | 'categoryId' >
): Promise< EpisodesPage > => {
	const query: Record< string, string | number > = {
		categories: String( categoryId ),
		page,
		per_page: perPage,
		orderby: orderBy,
		order,
		status,
		_embed: 'wp:featuredmedia',
	};
	if ( search ) {
		query.search = search;
	}

	return new Promise( ( resolve, reject ) => {
		wpcom.req.get(
			{
				path: `/sites/${ siteId }/posts`,
				apiNamespace: 'wp/v2',
			},
			query,
			( error: Error | null, data: EpisodePost[] = [], headers: EpisodeHeaders = {} ) => {
				if ( error ) {
					return reject( error );
				}
				resolve( {
					posts: Array.isArray( data ) ? data : [],
					totalItems: Number( headers[ 'X-WP-Total' ] || 0 ),
					totalPages: Number( headers[ 'X-WP-TotalPages' ] || 0 ),
				} );
			}
		);
	} );
};

const useEpisodesQuery = ( params: Params ) => {
	const { siteId, categoryId, page, perPage, orderBy, order, search, status } = params;
	return useQuery< EpisodesPage >( {
		queryKey: [
			'podcast-episodes',
			siteId,
			categoryId,
			page,
			perPage,
			orderBy,
			order,
			search,
			status,
		],
		queryFn: () =>
			fetchEpisodesPage( siteId as number, categoryId, {
				page,
				perPage,
				orderBy,
				order,
				search,
				status,
			} ),
		enabled: !! siteId && !! categoryId,
		// Keep the previous page visible while the next one loads so the table
		// doesn't flash empty between paginations / sort changes.
		placeholderData: ( previous ) => previous,
	} );
};

export default useEpisodesQuery;
