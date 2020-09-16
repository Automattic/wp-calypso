/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal Dependencies
 */
import ConciergeBanner from 'me/purchases/concierge-banner';
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';
import getConciergeScheduleId from 'state/selectors/get-concierge-schedule-id.js';
import {
	CONCIERGE_HAS_UPCOMING_APPOINTMENT,
	CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION,
	CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION,
	CONCIERGE_SUGGEST_PURCHASE_CONCIERGE,
	CONCIERGE_WPCOM_BUSINESS_ID,
	CONCIERGE_WPCOM_SESSION_PRODUCT_ID,
} from 'me/concierge/constants';
import { recordTracksEvent } from 'state/analytics/actions';

export default function SubscriptionsConciergeBanner() {
	const nextAppointment = useSelector( ( state ) => getConciergeNextAppointment( state ) );
	const scheduleId = useSelector( ( state ) => getConciergeScheduleId( state ) );
	const reduxDispatch = useDispatch();
	const dispatchRecordTracksEvent = ( ...args: unknown[] ) =>
		reduxDispatch( recordTracksEvent( args ) );

	if ( null === scheduleId ) {
		return (
			<ConciergeBanner bannerType={ CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION } showPlaceholder />
		);
	}

	let bannerType;

	if ( nextAppointment ) {
		bannerType = CONCIERGE_HAS_UPCOMING_APPOINTMENT;
	} else if ( scheduleId ) {
		switch ( scheduleId ) {
			case CONCIERGE_WPCOM_BUSINESS_ID:
				bannerType = CONCIERGE_HAS_AVAILABLE_INCLUDED_SESSION;
				break;

			case CONCIERGE_WPCOM_SESSION_PRODUCT_ID:
				bannerType = CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION;
				break;

			default:
				bannerType = CONCIERGE_HAS_AVAILABLE_PURCHASED_SESSION;
		}
	} else {
		bannerType = CONCIERGE_SUGGEST_PURCHASE_CONCIERGE;
	}

	return (
		<ConciergeBanner bannerType={ bannerType } recordTracksEvent={ dispatchRecordTracksEvent } />
	);
}
