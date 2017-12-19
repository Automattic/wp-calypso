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
import { makeAppointmentSuccess } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_MAKE_APPOINTMENT_REQUEST } from 'state/action-types';

export const toApi = ( { beginTimestamp, customerId, siteId, meta } ) => ( {
	begin_timestamp: beginTimestamp,
	customer_id: customerId,
	site_id: siteId,
	meta,
} );

export const makeAppointment = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'POST',
				path: `/concierge/schedules/${ action.scheduleId }/appointments`,
				apiNamespace: 'wpcom/v2',
				body: toApi( action ),
			},
			action
		)
	);
};

export const dispatchMakeAppointmentSuccess = ( { dispatch } ) =>
	dispatch( makeAppointmentSuccess() );

export const makeAppointmentError = () =>
	errorNotice(
		translate( "We couldn't make an appointment for you at the moment. Please try again later." )
	);

export const showMakeAppointmentError = ( { dispatch } ) => dispatch( makeAppointmentError() );

export default {
	[ CONCIERGE_MAKE_APPOINTMENT_REQUEST ]: [
		dispatchRequest( makeAppointment, makeAppointmentSuccess, showMakeAppointmentError ),
	],
};
