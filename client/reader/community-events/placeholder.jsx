/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';

class EventPlaceholder extends React.PureComponent {
	render() {
		return (
			<CompactCard className="community-events__event-placeholder">
				<CardHeading tagName="h2" size={ 21 }>
					Loading interesting events...
				</CardHeading>
				<div className="community-events__event-details-container">
					<div className="community-events__event-details">
						<strong className="community-events__event-meetup">Loading event meetup...</strong>
						<div className="community-events__event-date">Event date</div>
						<div className="community-events__event-location">Event location</div>
					</div>
					<ExternalLink icon={ true } className="community-events__event-link">
						Event details
					</ExternalLink>
				</div>
			</CompactCard>
		);
	}
}

export default EventPlaceholder;
