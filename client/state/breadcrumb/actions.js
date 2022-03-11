import {
	BREADCRUMB_RESET_LIST,
	BREADCRUMB_UPDATE_LIST,
	BREADCRUMB_APPEND_ITEM,
} from 'calypso/state/action-types';

import 'calypso/state/breadcrumb/init';

export function resetBreadcrumbs( siteId = 0 ) {
	return {
		type: BREADCRUMB_RESET_LIST,
		siteId,
	};
}

export function updateBreadcrumbs( siteId = 0, items ) {
	return {
		type: BREADCRUMB_UPDATE_LIST,
		siteId,
		items,
	};
}

export function appendBreadcrumb( siteId = 0, item ) {
	return {
		type: BREADCRUMB_APPEND_ITEM,
		siteId,
		item,
	};
}
