import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type ISO_8601_Datetime = string;

type PostType = 'post' | 'page' | string;

// Parameters as per Jetpack's WPCOM_JSON_API_List_Posts_v1_1_Endpoint documentation
type PostsRequestParams = Partial< {
	number: number;
	offset: number;
	page: number;
	page_handle: string;
	order: 'ASC' | 'DESC';
	order_by: 'date' | 'ID' | 'modified' | 'title' | 'comment_count';
	after: ISO_8601_Datetime;
	before: ISO_8601_Datetime;
	modified_after: ISO_8601_Datetime;
	modified_before: ISO_8601_Datetime;
	tag: string;
	category: string;
	term: string;
	type: PostType;
	parent_id: string;
	exclude: number | number[];
	exclude_tree: number;
	status: string;
	sticky: 'include' | 'exclude' | 'require';
	author: string;
	search: string;
	meta_key: string;
	meta_value: string;
} >;

type Post = {
	ID: number;
	title: string;
	type: PostType;
};

type Response = {
	found: number;
	posts: Post[];
};

const usePostsQuery = ( siteId?: number, params: PostsRequestParams = {}, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'sites', siteId, 'posts', params ],
		queryFn: (): Promise< Response > => wpcom.req.get( `/sites/${ siteId }/posts`, params ),
		enabled: !! siteId,
		...queryOptions,
	} );
};

export default usePostsQuery;
