import { useTranslate } from 'i18n-calypso';
import Offering from 'calypso/a8c-for-agencies/components/offering';
import UpcomingEvent from 'calypso/a8c-for-agencies/components/upcoming-event';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import { useUpcomingEvents } from './hooks/use-upcoming-events';

import './styles.scss';

const OverviewBodyEvents = () => {
	const translate = useTranslate();

	const upcomingEvents = useUpcomingEvents();

	const renderEvent = ( event: UpcomingEventProps ) => {
		return <UpcomingEvent key={ event.id } { ...event } />;
	};

	if ( ! upcomingEvents.length ) {
		return null;
	}

	return (
		<Offering
			title={ translate( 'Upcoming events' ) }
			description={ translate(
				'Grow your business and level up by joining exclusive Automattic for Agencies events.'
			) }
		>
			<div className="a4a-events">{ upcomingEvents.map( renderEvent ) }</div>
		</Offering>
	);
};

export default OverviewBodyEvents;
