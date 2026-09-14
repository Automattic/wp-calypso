import { readSiteQuery } from '@automattic/api-queries';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_SITE_BLOCK,
	READER_SITE_BLOCKS_REQUEST,
	READER_SITE_UNBLOCK,
} from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/me/block/sites/delete';
import 'calypso/state/data-layer/wpcom/me/block/sites/new';
import 'calypso/state/data-layer/wpcom/me/blocks/sites';

import 'calypso/state/reader/init';

function updateCachedReadSiteBlockStatus( siteId, isBlocked ) {
	const queryClient = getCalypsoQueryClient();
	if ( ! queryClient || ! siteId ) {
		return;
	}

	queryClient.setQueryData( readSiteQuery( siteId ).queryKey, ( site ) =>
		site
			? {
					...site,
					is_blocked: isBlocked,
			  }
			: site
	);
}

export function blockSite( siteId ) {
	updateCachedReadSiteBlockStatus( siteId, true );

	return {
		type: READER_SITE_BLOCK,
		payload: {
			siteId,
		},
	};
}

export function unblockSite( siteId ) {
	updateCachedReadSiteBlockStatus( siteId, false );

	return {
		type: READER_SITE_UNBLOCK,
		payload: {
			siteId,
		},
	};
}

export function requestSiteBlocks( { page } = {} ) {
	return {
		type: READER_SITE_BLOCKS_REQUEST,
		payload: {
			page,
		},
	};
}
