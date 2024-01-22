/**
 * TypeScript type definitions for wpcom-proxy-request
 * @todo Migrate `src/index.js` to TypeScript, incorporate these type definitions.
 * (Needs changes to the build chain, see other packages in the monorepo
 * for inspiration, e.g. `@automattic/data-stores`.)
 */

export interface WpcomRequestParams {
	path?: string;
	method?: string;
	apiVersion?: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	body?: object;
	token?: string;
	query?: string;
	metaAPI?: {
		accessAllUsersBlogs?: boolean;
	};
	apiNamespace?: string;
	formData?: ( string | File )[][];
}

export function reloadProxy(): void;

export function canAccessWpcomApis(): boolean;

export function requestAllBlogsAccess(): ReturnType< typeof request >;

export default function request(
	params: WpcomRequestParams,
	callback: ( err: unknown, body: unknown, headers: unknown ) => void
): XMLHttpRequest;
export default function request< T >( params: WpcomRequestParams ): Promise< T >;
