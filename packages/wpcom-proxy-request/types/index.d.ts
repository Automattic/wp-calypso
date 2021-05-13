/**
 * TypeScript type definitions for wpcom-proxy-request
 *
 * @todo Migrate `src/index.js` to TypeScript, incorporate these type definitions.
 * (Needs changes to the build chain, see other packages in the monorepo
 * for inspiration, e.g. `@automattic/data-stores`.)
 */

export interface WpcomRequestParams {
	path?: string;
	method?: string;
	apiVersion?: string;
	body?: object;
	token?: string;
	query?: string;
	metaAPI?: {
		accessAllUsersBlogs?: boolean;
	};
}

export function reloadProxy(): void;

export function requestAllBlogsAccess(): ReturnType< typeof request >;

export default function request( params: WpcomRequestParams, callback: Function ): XMLHttpRequest;
export default function request< T >( params: WpcomRequestParams ): Promise< T >;
