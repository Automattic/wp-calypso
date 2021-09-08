import { findLast } from 'lodash';
import { GUIDED_TOUR_UPDATE } from 'calypso/state/action-types';
import { getActionLog } from 'calypso/state/ui/action-log/selectors';

import 'calypso/state/guided-tours/init';

/*
 * When applicable, returns the name of the tour that has been started and not
 * yet finished or dimissed according to the action log.
 */
export default ( state ) => {
	const last = findLast( getActionLog( state ), { type: GUIDED_TOUR_UPDATE } );
	return last && last.shouldShow === undefined && last.tour;
};
