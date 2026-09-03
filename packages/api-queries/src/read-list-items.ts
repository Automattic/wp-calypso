import {
	addReadListFeed,
	addReadListTag,
	deleteReadListFeed,
	deleteReadListSite,
	deleteReadListTag,
	fetchReadListItems,
	type ReadListItem,
	type ReadListItemsResponse,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	queryOptions,
	type QueryClient,
} from '@tanstack/react-query';

const ITEMS_PER_PAGE = 20;

export const readListItemsQuery = ( userLogin: string, listName: string, meta: string = '' ) =>
	queryOptions( {
		queryKey: [ 'read', 'lists', userLogin, listName, 'items', meta ],
		queryFn: () => fetchReadListItems( userLogin, listName, meta ),
		enabled: !! userLogin && !! listName,
		staleTime: 1000 * 60 * 5,
	} );

export const readListItemsInfiniteQuery = (
	userLogin: string,
	listName: string,
	meta: string = ''
) =>
	infiniteQueryOptions( {
		queryKey: [ 'read', 'lists', userLogin, listName, 'items', meta, 'infinite' ],
		queryFn: ( { pageParam }: { pageParam: number } ) =>
			fetchReadListItems( userLogin, listName, meta, pageParam, ITEMS_PER_PAGE ),
		enabled: !! userLogin && !! listName,
		staleTime: 1000 * 60 * 5,
		initialPageParam: 1,
		getNextPageParam: ( lastPage: ReadListItemsResponse, allPages: ReadListItemsResponse[] ) => {
			if ( ! lastPage?.items || lastPage.items.length < ITEMS_PER_PAGE ) {
				return undefined;
			}

			return allPages.length + 1;
		},
	} );

// Default React Query retry count.
const DEFAULT_RETRY = 3;
// Matches the legacy data-layer's flat fetch (`number: 2000`, full meta).
const ALL_ITEMS_META = 'site,feed,tag';
const ALL_ITEMS_PAGE_SIZE = 2000;

export const readListItemsAllQuery = ( owner?: string | null, slug?: string | null ) =>
	queryOptions( {
		queryKey: [ 'read', 'lists', owner, slug, 'items', 'all' ],
		queryFn: () => fetchReadListItems( owner!, slug!, ALL_ITEMS_META, 1, ALL_ITEMS_PAGE_SIZE ),
		enabled: !! owner && !! slug,
		staleTime: 1000 * 60 * 5,
		// `list_not_found` is a permanent 404 (e.g. user has no recommended-blogs
		// list). Retrying just delays the empty result; matches the legacy
		// data-layer's `noRetry()` policy without disabling retries for transient
		// network failures.
		retry: ( failureCount, error ) => {
			if ( ( error as { error?: string } | undefined )?.error === 'list_not_found' ) {
				return false;
			}
			return failureCount < DEFAULT_RETRY;
		},
	} );

interface ListItemMutationContext {
	previous?: ReadListItemsResponse;
}

function itemsQueryKey( owner: string, slug: string ) {
	return readListItemsAllQuery( owner, slug ).queryKey;
}

// Broader prefix that also matches `readListItemsQuery` and
// `readListItemsInfiniteQuery`, so a mutation against the `'all'` cache also
// invalidates the paginated/infinite views (e.g. list header total count,
// list/views/sites). Mirrors the legacy data-layer's
// `invalidateUserListItemsQuery` prefix.
function itemsInvalidationKey( owner: string, slug: string ) {
	return [ 'read', 'lists', owner, slug, 'items' ] as const;
}

async function snapshotAndOptimisticallyUpdate(
	queryClient: QueryClient,
	owner: string,
	slug: string,
	updater: ( items: ReadListItem[] ) => ReadListItem[]
): Promise< ListItemMutationContext > {
	const queryKey = itemsQueryKey( owner, slug );
	await queryClient.cancelQueries( { queryKey: itemsInvalidationKey( owner, slug ) } );
	const previous = queryClient.getQueryData< ReadListItemsResponse >( queryKey );
	if ( previous ) {
		queryClient.setQueryData< ReadListItemsResponse >( queryKey, {
			...previous,
			items: updater( previous.items ),
		} );
	}
	return { previous };
}

function rollback(
	queryClient: QueryClient,
	owner: string,
	slug: string,
	context: ListItemMutationContext | undefined
) {
	if ( context?.previous ) {
		queryClient.setQueryData( itemsQueryKey( owner, slug ), context.previous );
	}
}

function invalidateItems( queryClient: QueryClient, owner: string, slug: string ) {
	return queryClient.invalidateQueries( { queryKey: itemsInvalidationKey( owner, slug ) } );
}

export interface AddReadListFeedVariables {
	owner: string;
	slug: string;
	feedId?: number;
	feedUrl?: string;
}

export const addReadListFeedMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, AddReadListFeedVariables, ListItemMutationContext >( {
		meta: { statId: 'read-list-feed-add' },
		mutationFn: ( variables ) => addReadListFeed( variables ),
		onMutate: ( { owner, slug, feedId } ) =>
			snapshotAndOptimisticallyUpdate( queryClient, owner, slug, ( items ) => {
				if ( feedId == null ) {
					return items;
				}
				if ( items.some( ( item ) => Number( item.feed_ID ) === Number( feedId ) ) ) {
					return items;
				}
				return [ ...items, { feed_ID: feedId } ];
			} ),
		onError: ( _error, { owner, slug }, context ) => rollback( queryClient, owner, slug, context ),
		onSettled: ( _data, _error, { owner, slug } ) => invalidateItems( queryClient, owner, slug ),
	} );

export interface DeleteReadListFeedVariables {
	owner: string;
	slug: string;
	feedId: number;
}

export const deleteReadListFeedMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, DeleteReadListFeedVariables, ListItemMutationContext >( {
		meta: { statId: 'read-list-feed-delete' },
		mutationFn: ( variables ) => deleteReadListFeed( variables ),
		onMutate: ( { owner, slug, feedId } ) =>
			snapshotAndOptimisticallyUpdate( queryClient, owner, slug, ( items ) =>
				items.filter( ( item ) => Number( item.feed_ID ) !== Number( feedId ) )
			),
		onError: ( _error, { owner, slug }, context ) => rollback( queryClient, owner, slug, context ),
		onSettled: ( _data, _error, { owner, slug } ) => invalidateItems( queryClient, owner, slug ),
	} );

export interface DeleteReadListSiteVariables {
	owner: string;
	slug: string;
	siteId: number;
}

export const deleteReadListSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, DeleteReadListSiteVariables, ListItemMutationContext >( {
		meta: { statId: 'read-list-site-delete' },
		mutationFn: ( variables ) => deleteReadListSite( variables ),
		onMutate: ( { owner, slug, siteId } ) =>
			snapshotAndOptimisticallyUpdate( queryClient, owner, slug, ( items ) =>
				items.filter( ( item ) => Number( item.site_ID ) !== Number( siteId ) )
			),
		onError: ( _error, { owner, slug }, context ) => rollback( queryClient, owner, slug, context ),
		onSettled: ( _data, _error, { owner, slug } ) => invalidateItems( queryClient, owner, slug ),
	} );

export interface AddReadListTagVariables {
	owner: string;
	slug: string;
	tagSlug: string;
	// Optional — supplied by consumers that already know the tag's ID (e.g. the
	// list-manage suggestion picker) so we can apply an optimistic placeholder
	// against the items cache. The mutation request itself doesn't need it.
	tagId?: number;
}

export const addReadListTagMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, AddReadListTagVariables, ListItemMutationContext >( {
		meta: { statId: 'read-list-tag-add' },
		mutationFn: ( variables ) => addReadListTag( variables ),
		onMutate: ( { owner, slug, tagId, tagSlug } ) =>
			snapshotAndOptimisticallyUpdate( queryClient, owner, slug, ( items ) => {
				if ( tagId == null ) {
					return items;
				}
				if ( items.some( ( item ) => Number( item.tag_ID ) === Number( tagId ) ) ) {
					return items;
				}
				return [
					...items,
					{
						tag_ID: tagId,
						meta: { data: { tag: { tag: { ID: tagId, slug: tagSlug } } } },
					},
				];
			} ),
		onError: ( _error, { owner, slug }, context ) => rollback( queryClient, owner, slug, context ),
		onSettled: ( _data, _error, { owner, slug } ) => invalidateItems( queryClient, owner, slug ),
	} );

export interface DeleteReadListTagVariables {
	owner: string;
	slug: string;
	tagId: number;
	tagSlug: string;
}

export const deleteReadListTagMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, DeleteReadListTagVariables, ListItemMutationContext >( {
		meta: { statId: 'read-list-tag-delete' },
		mutationFn: ( variables ) => deleteReadListTag( variables ),
		onMutate: ( { owner, slug, tagId } ) =>
			snapshotAndOptimisticallyUpdate( queryClient, owner, slug, ( items ) =>
				items.filter( ( item ) => Number( item.tag_ID ) !== Number( tagId ) )
			),
		onError: ( _error, { owner, slug }, context ) => rollback( queryClient, owner, slug, context ),
		onSettled: ( _data, _error, { owner, slug } ) => invalidateItems( queryClient, owner, slug ),
	} );
