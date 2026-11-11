import { useTranslate } from 'i18n-calypso';
import useIsEligibleForExpansionOffer from 'calypso/a8c-for-agencies/components/a4a-pressable-offer/hooks/use-is-eligible-for-expansion-offer';
import usePressableOfferEligibility from 'calypso/a8c-for-agencies/components/a4a-pressable-offer/hooks/use-pressable-offer-eligibility';
import Offering from 'calypso/a8c-for-agencies/components/offering';
import UpcomingEvent from 'calypso/a8c-for-agencies/components/upcoming-event';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import { useUpcomingEvents } from './hooks/use-upcoming-events';

import './styles.scss';

const EventsList = ( {
	showPressableExpansionOffer,
}: {
	showPressableExpansionOffer: boolean;
} ) => {
	const translate = useTranslate();

	const upcomingEvents = useUpcomingEvents( { showPressableExpansionOffer } );

	const renderEvent = ( event: UpcomingEventProps ) => {
		return <UpcomingEvent key={ event.id } { ...event } />;
	};

	if ( ! upcomingEvents.length ) {
		return null;
	}

	return (
		<Offering
			title={ translate( 'News and updates' ) }
			description={ translate(
				'Stay informed with important announcements, events, and opportunities from Automattic for Agencies.'
			) }
		>
			<div className="a4a-events">{ upcomingEvents.map( renderEvent ) }</div>
		</Offering>
	);
};

const EventsListWithExpansionOfferCheck = () => {
	const isEligibleForExpansionOffer = useIsEligibleForExpansionOffer();

	return <EventsList showPressableExpansionOffer={ isEligibleForExpansionOffer } />;
};

const OverviewBodyEvents = () => {
	const { mayBeEligibleForExpansionOffer } = usePressableOfferEligibility();

	// Gate before rendering so the license fetch behind the expansion offer
	// check only runs for agencies that own a Pressable plan through A4A.
	if ( mayBeEligibleForExpansionOffer ) {
		return <EventsListWithExpansionOfferCheck />;
	}

	return <EventsList showPressableExpansionOffer={ false } />;
};

export default OverviewBodyEvents;
