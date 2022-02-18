import {
	BREADCRUMB_RESET_LIST,
	BREADCRUMB_UPDATE_LIST,
	BREADCRUMB_APPEND_ITEM,
} from 'calypso/state/action-types';

import 'calypso/state/breadcrumb/init';

export function resetBreadcrumbs() {
	return {
		type: BREADCRUMB_RESET_LIST,
	};
}

export function updateBreadcrumbs( items ) {
	return {
		type: BREADCRUMB_UPDATE_LIST,
		items,
	};
}

export function appendBreadcrumb( item ) {
	return {
		type: BREADCRUMB_APPEND_ITEM,
		item,
	};
}
