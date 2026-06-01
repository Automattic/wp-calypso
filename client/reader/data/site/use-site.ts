import { readSiteQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { READER_SITE_RECEIVE } from 'calypso/state/reader/action-types';
import type { ReadSiteResponse } from '@automattic/api-core';

interface SiteError {
	statusCode: number;
}

export interface UseSiteResult {
	site: ReadSiteResponse | undefined;
	siteError: SiteError | undefined;
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
}

const dispatchedSiteUpdates = new Map< number, number >();

/**
 * React-Query backed accessor for a Reader site (`/read/sites/{siteId}`).
 *
 * Also dispatches `READER_SITE_RECEIVE` with the raw API payload when the
 * query resolves so legacy follows and site-blocks reducers can stay in sync.
 */
export function useSite( siteId: number | string | undefined ): UseSiteResult {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const query = useQuery( readSiteQuery( siteId ) );
	const id = typeof siteId === 'string' ? Number( siteId ) : siteId;

	useEffect( () => {
		if ( ! query.isSuccess || typeof id !== 'number' || ! Number.isFinite( id ) ) {
			return;
		}
		if ( dispatchedSiteUpdates.get( id ) === query.dataUpdatedAt ) {
			return;
		}
		// `query.data` has already passed through adaptReadSite, which strips subscription.
		const raw = queryClient.getQueryData< ReadSiteResponse >( readSiteQuery( id ).queryKey );
		if ( ! raw ) {
			return;
		}
		dispatchedSiteUpdates.set( id, query.dataUpdatedAt );
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
