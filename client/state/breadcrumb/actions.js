import {
	BREADCRUMB_RESET_LIST,
	BREADCRUMB_UPDATE_LIST,
	BREADCRUMB_APPEND_ITEM,
} from 'calypso/state/action-types';

import 'calypso/state/breadcrumb/init';

export function resetBreadcrumbs( siteId ) {
	return {
		type: BREADCRUMB_RESET_LIST,
		siteId,
	};
}

export function updateBreadcrumbs( siteId, items ) {
	return {
		type: BREADCRUMB_UPDATE_LIST,
		siteId,
		items,
	};
}

export function appendBreadcrumb( siteId, item ) {
	return {
		type: BREADCRUMB_APPEND_ITEM,
		siteId,
		item,
	};
}
