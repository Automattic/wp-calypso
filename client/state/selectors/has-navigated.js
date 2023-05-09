import { filter } from 'lodash';
import { ROUTE_SET } from 'calypso/state/action-types';
import { getActionLog } from 'calypso/state/ui/action-log/selectors';

export default function hasNavigated( state ) {
	return filter( getActionLog( state ), { type: ROUTE_SET } ).length > 1;
}
