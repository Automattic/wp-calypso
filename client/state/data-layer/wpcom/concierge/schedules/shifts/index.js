/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeShifts } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_SHIFTS_REQUEST } from 'state/action-types';
import fromApi from './from-api';

export const fetchConciergeShifts = ( { dispatch }, action ) => {
	const { scheduleId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/concierge/schedules/${ scheduleId }/shifts`,
				apiNamespace: 'wpcom/v2',
			},
			action
		)
	);
};

export const storeFetchedConciergeShifts = ( { dispatch }, action, shifts ) =>
	dispatch( updateConciergeShifts( shifts ) );

export const conciergeShiftsFetchError = () =>
	errorNotice( translate( "We couldn't load our Concierge schedule. Please try again later." ) );

export const showConciergeShiftsFetchError = ( { dispatch } ) =>
	dispatch( conciergeShiftsFetchError() );

export default {
	[ CONCIERGE_SHIFTS_REQUEST ]: [
		dispatchRequest(
			fetchConciergeShifts,
			storeFetchedConciergeShifts,
			showConciergeShiftsFetchError,
			{ fromApi }
		),
	],
};
