/**
 * External dependencies
 */
import { findLast } from 'lodash';

/**
 * Internal dependencies
 */
import { GUIDED_TOUR_UPDATE } from 'state/action-types';
import { getActionLog } from 'state/ui/action-log/selectors';

/*
 * When applicable, returns the name of the tour that has been started and not
 * yet finished or dimissed according to the action log.
 */
export default state => {
	const last = findLast( getActionLog( state ), { type: GUIDED_TOUR_UPDATE } );
	return last && ( last.shouldShow === undefined ) && last.tour;
};

