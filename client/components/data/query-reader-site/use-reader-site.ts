import { readSiteQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { READER_SITE_RECEIVE } from 'calypso/state/reader/action-types';
import type { ReadSiteResponse } from '@automattic/api-core';

interface SiteError {
	statusCode: number;
}

export interface UseReaderSiteResult {
	site: ReadSiteResponse | undefined;
	siteError: SiteError | undefined;
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
}

/**
 * React-Query backed accessor for a Reader site (`/read/sites/{siteId}`).
 *
 * Also dispatches `READER_SITE_RECEIVE` (with the **raw** API payload) when
 * the query resolves so the legacy `state.reader.follows` and
 * `state.reader.siteBlocks` reducers can stay in sync. The dispatch fires
 * once per payload via a ref guard. The legacy cross-slice listeners read
 * `subscription.delivery_methods` which `adaptReadSite` strips, so the dispatch
 * pulls the pre-`select` payload from the cache rather than the hook's `site`.
 */
export function useReaderSite( siteId: number | string | undefined ): UseReaderSiteResult {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const lastDispatched = useRef< unknown >( undefined );

	const query = useQuery( readSiteQuery( siteId ) );
	const id = typeof siteId === 'string' ? Number( siteId ) : siteId;

	useEffect( () => {
		if ( ! query.isSuccess || typeof id !== 'number' || ! Number.isFinite( id ) ) {
			return;
		}
		const raw = queryClient.getQueryData< ReadSiteResponse >( [ 'read', 'sites', id ] );
		if ( ! raw || raw === lastDispatched.current ) {
			return;
		}
		lastDispatched.current = raw;
		dispatch( { type: READER_SITE_RECEIVE, payload: raw } );
	}, [ query.isSuccess, query.dataUpdatedAt, id, queryClient, dispatch ] );

	const errorStatusCode = ( query.error as { statusCode?: number } | null )?.statusCode;

	return {
		site: query.data,
		siteError:
			query.isError && typeof errorStatusCode === 'number'
				? { statusCode: errorStatusCode }
				: undefined,
		isLoading: query.isLoading,
		isError: query.isError,
		isSuccess: query.isSuccess,
	};
}
