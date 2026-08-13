import { useTranslate } from 'i18n-calypso';
import useHasBenefitedFromIntroductoryOffer from 'calypso/a8c-for-agencies/components/a4a-pressable-offer/hooks/use-has-benefited-from-introductory-offer';
import Offering from 'calypso/a8c-for-agencies/components/offering';
import UpcomingEvent from 'calypso/a8c-for-agencies/components/upcoming-event';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
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
	const { hasBenefited, isReady } = useHasBenefitedFromIntroductoryOffer();

	return <EventsList showPressableExpansionOffer={ isReady && hasBenefited === false } />;
};

const OverviewBodyEvents = () => {
	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	// Gate before rendering so the license fetch behind the expansion offer
	// check only runs for agencies that own a Pressable plan through A4A.
	const isEligibleForExpansionOffer =
		agency?.billing_system === 'billingdragon' && pressableOwnership === 'agency';

	if ( isEligibleForExpansionOffer ) {
		return <EventsListWithExpansionOfferCheck />;
	}

	return <EventsList showPressableExpansionOffer={ false } />;
};

export default OverviewBodyEvents;
