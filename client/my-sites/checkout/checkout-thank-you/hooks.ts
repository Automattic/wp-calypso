import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { addOnboardingCallInternalNote } from './utils';

interface CalendlyEvent {
	data: {
		event: string;
		payload: {
			event: {
				uri: string;
			};
		};
	};
}

interface CalendlyListenerProps {
	productSlug: string;
	receiptId: number;
	jetpackTemporarySiteId: number;
}

export function useSetCalendlyListenerEffect( {
	productSlug,
	receiptId,
	jetpackTemporarySiteId,
}: CalendlyListenerProps ) {
	const dispatch = useDispatch();
	useEffect( () => {
		const dispatchCalendlyEventScheduled = async ( event: CalendlyEvent ) => {
			if ( event && event.data?.event === 'calendly.event_scheduled' ) {
				const eventUri = event.data.payload?.event?.uri || '';
				// The last part of the pathname is the ID of the Calendly event
				const eventId = new URL( eventUri ).pathname.split( '/' ).pop();
				const result = await addOnboardingCallInternalNote(
					receiptId,
					jetpackTemporarySiteId,
					eventId
				);
				if ( result ) {
					dispatch(
						recordTracksEvent( 'calypso_siteless_checkout_schedule_onboarding_call', {
							product_slug: productSlug,
							receipt_id: receiptId,
							event_id: eventId,
						} )
					);
				}
			}
		};

		window.addEventListener( 'message', dispatchCalendlyEventScheduled );

		return () => {
			window.removeEventListener( 'message', dispatchCalendlyEventScheduled );
		};
	}, [] );
}
