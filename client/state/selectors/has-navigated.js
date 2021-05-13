/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { getActionLog } from 'calypso/state/ui/action-log/selectors';
import { ROUTE_SET } from 'calypso/state/action-types';

export default function hasNavigated( state ) {
	return filter( getActionLog( state ), { type: ROUTE_SET } ).length > 1;
}
