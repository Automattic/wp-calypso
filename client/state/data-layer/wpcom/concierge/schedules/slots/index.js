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
import { updateConciergeSlots } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_SLOTS_REQUEST } from 'state/action-types';
import fromApi from './from-api';

export const fetchConciergeSlots = ( { dispatch }, action ) => {
	const { scheduleId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/concierge/schedules/${ scheduleId }/slots`,
				apiNamespace: 'wpcom/v2',
			},
			action
		)
	);
};

export const storeFetchedConciergeSlots = ( { dispatch }, action, slots ) =>
	dispatch( updateConciergeSlots( slots ) );

export const conciergeSlotsFetchError = () =>
	errorNotice( translate( "We couldn't load our Concierge schedule. Please try again later." ) );

export const showConciergeSlotsFetchError = ( { dispatch } ) =>
	dispatch( conciergeSlotsFetchError() );

export default {
	[ CONCIERGE_SLOTS_REQUEST ]: [
		dispatchRequest(
			fetchConciergeSlots,
			storeFetchedConciergeSlots,
			showConciergeSlotsFetchError,
			{ fromApi }
		),
	],
};
