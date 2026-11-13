import type { DomainSummary } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

import './table-actions.scss';

export const DOMAINS_TABLE_CLASS_NAME = 'domains-table';

/**
 * DataViews shows the row menu only when a row has eligible actions beyond its primary ones,
 * so passing just the primary actions leaves the inline buttons on their own.
 */
export function getTableActions( actions: Action< DomainSummary >[] ) {
	return actions.filter( ( action ) => action.isPrimary );
}
