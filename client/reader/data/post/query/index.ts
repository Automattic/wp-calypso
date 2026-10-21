import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { normalizePostsForCache, syncNormalizedPostsToCache, type Post } from '../cache';
import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type PostProducingQueryOptions< TQueryData, TError, TQueryKey extends QueryKey > = Omit<
	UseQueryOptions< TQueryData, TError, TQueryData, TQueryKey >,
	'select'
> & {
	queryKey: TQueryKey;
};

type PostProducingQueryConfig = {
	onPostsSynced?: ( posts: Post[] ) => void;
};

const useOnPostsSyncedRef = ( onPostsSynced?: ( posts: Post[] ) => void ) => {
	const onPostsSyncedRef = useRef( onPostsSynced );

	useEffect( () => {
		onPostsSyncedRef.current = onPostsSynced;
	}, [ onPostsSynced ] );

	return onPostsSyncedRef;
};

const queryKeyToken = ( queryKey: QueryKey ) => JSON.stringify( queryKey );

export const usePostsQuery = < TQueryData, TError = Error, TQueryKey extends QueryKey = QueryKey >(
	queryOptions: PostProducingQueryOptions< TQueryData, TError, TQueryKey >,
	getPosts: ( data: TQueryData ) => Array< Post | null | undefined >,
	config: PostProducingQueryConfig = {}
): UseQueryResult< Post[], TError > => {
	const queryClient = useQueryClient();
	const onPostsSyncedRef = useOnPostsSyncedRef( config.onPostsSynced );
	const lastSyncedTokenRef = useRef< string | null >( null );
	const query = useQuery< TQueryData, TError, Post[], TQueryKey >( {
		...queryOptions,
		select: ( data ) => normalizePostsForCache( getPosts( data ) ),
	} );

	useEffect( () => {
		if ( ! query.data?.length ) {
			return;
		}

		const syncToken = `${ queryKeyToken( queryOptions.queryKey ) }:${ query.dataUpdatedAt }`;
		if ( lastSyncedTokenRef.current === syncToken ) {
			return;
		}

		lastSyncedTokenRef.current = syncToken;
		syncNormalizedPostsToCache( queryClient, query.data );
		onPostsSyncedRef.current?.( query.data );
	}, [ onPostsSyncedRef, query.data, query.dataUpdatedAt, queryClient, queryOptions.queryKey ] );

	return query;
};

export const usePostQuery = < TQueryData, TError = Error, TQueryKey extends QueryKey = QueryKey >(
	queryOptions: PostProducingQueryOptions< TQueryData, TError, TQueryKey >,
	getPost: ( data: TQueryData ) => Post | null | undefined,
	config: PostProducingQueryConfig = {}
): UseQueryResult< Post | undefined, TError > => {
	const queryClient = useQueryClient();
	const onPostsSyncedRef = useOnPostsSyncedRef( config.onPostsSynced );
	const lastSyncedTokenRef = useRef< string | null >( null );
	const query = useQuery< TQueryData, TError, Post | undefined, TQueryKey >( {
		...queryOptions,
		select: ( data ) => normalizePostsForCache( [ getPost( data ) ] )[ 0 ],
	} );

	useEffect( () => {
		if ( ! query.data ) {
			return;
		}

		const syncToken = `${ queryKeyToken( queryOptions.queryKey ) }:${ query.dataUpdatedAt }`;
		if ( lastSyncedTokenRef.current === syncToken ) {
			return;
		}

		lastSyncedTokenRef.current = syncToken;
		syncNormalizedPostsToCache( queryClient, [ query.data ] );
		onPostsSyncedRef.current?.( [ query.data ] );
	}, [ onPostsSyncedRef, query.data, query.dataUpdatedAt, queryClient, queryOptions.queryKey ] );

	return query;
};
