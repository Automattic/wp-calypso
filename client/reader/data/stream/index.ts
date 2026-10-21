export {
	getStreamInfiniteQueryKey,
	getStreamInfiniteQueryKeyPrefix,
	parseStreamInfiniteQueryKey,
} from '@automattic/api-queries';
export type {
	PageHandle,
	StreamIdentity,
	StreamInfiniteQueryKey,
	StreamInfiniteQueryKeyPrefix,
} from '@automattic/api-queries';

export { getCachedStreamItems, removeStreamItemFromCache } from './cache';
export { buildStreamQueryParams } from './build-query-params';
export * from './normalization';
export {
	prefetchInfiniteStream,
	useInfiniteStream,
	type UseInfiniteStreamResult,
} from './hooks/use-infinite-stream';
export {
	fetchPaginatedStream,
	getPaginatedStreamQueryKeyPrefix,
	invalidatePaginatedStream,
	usePaginatedStream,
	type PaginatedStreamData,
} from './hooks/use-paginated-stream';
export type { PaddingStreamItem, StreamItem, StreamListItem, StreamPostKey } from './types';
export { isPaddingStreamItem } from './types';
