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
	query?: string | Record< string, string | number >;
	metaAPI?: {
		accessAllUsersBlogs?: boolean;
		setCrossOriginStorageItem?: { key: string; value: string };
		getCrossOriginStorageItem?: { key: string };
	};
	signal?: AbortSignal;
	apiNamespace?: string;
	formData?: ( string | File )[][];
	/**
	 * When `true`, the request returns a `WpcomStreamResponse` instead of the
	 * parsed response body. The response contains a `ReadableStream<Uint8Array>`
	 * whose chunks are SSE-formatted lines (`data: {json}\n\n`) produced each
	 * time the proxy iframe delivers a progressive (HTTP 207) stream record.
	 *
	 * The promise resolves immediately with the stream — before any data has
	 * arrived — so the caller can begin reading with a `ReadableStream` reader
	 * right away. The stream closes when the final response arrives, or errors
	 * if the request fails.
	 *
	 * Only supported in promise mode (no callback). Ignored when a callback is
	 * provided.
	 */
	emulateStreamBody?: boolean;
}

export function reloadProxy(): void;

export function canAccessWpcomApis(): boolean;

export function requestAllBlogsAccess(): ReturnType< typeof request >;

export function setCrossOriginStorageItem(
	key: string,
	value: string
): ReturnType< typeof request >;

export function getCrossOriginStorageItem( key: string ): ReturnType< typeof request >;

/**
 * Request params with `emulateStreamBody` required as `true`.
 * Used by the overload that returns a `WpcomStreamResponse`.
 */
export interface WpcomStreamRequestParams extends WpcomRequestParams {
	emulateStreamBody: true;
}

/**
 * Response shape returned when `emulateStreamBody` is `true`.
 * Mirrors the subset of the `Response` interface that stream
 * consumers typically need (e.g. an SSE parser).
 */
export interface WpcomStreamResponse {
	ok: boolean;
	status: number;
	body: ReadableStream< Uint8Array >;
}

/**
 * When `emulateStreamBody` is `true`, returns a promise that resolves
 * immediately with a `WpcomStreamResponse` containing a `ReadableStream`
 * of SSE-encoded `Uint8Array` chunks.
 */
export default function request( params: WpcomStreamRequestParams ): Promise< WpcomStreamResponse >;
export default function request(
	params: WpcomRequestParams,
	callback: ( err: unknown, body: unknown, headers: unknown ) => void
): XMLHttpRequest;
export default function request< T >( params: WpcomRequestParams ): Promise< T >;
