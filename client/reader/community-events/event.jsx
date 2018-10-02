/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

class CommunityEvent extends React.Component {
	static propTypes = {
		event: PropTypes.object,
	};

	recordExternalEventLinkClick = () => {
		const { url = '' } = this.props.event;
		recordAction( 'clicked_event_details_on_community_event' );
		recordGaEvent( 'Clicked Event Details on Community Event', url );
		recordTrack( 'calypso_reader_event_details_on_community_event_clicked', { url: url } );
	};

	render() {
		const {
			title = '',
			meetup = '',
			formatted_date = '',
			formatted_time = '',
			location: { location } = '',
			url = '',
		} = this.props.event;

		return (
			<CompactCard className="community-events__event">
				{ title && (
					<CardHeading tagName="h2" size={ 21 }>
						{ title }
					</CardHeading>
				) }
				<div className="community-events__event-details-container">
					<div className="community-events__event-details">
						<strong>{ meetup }</strong>
						<div className="community-events__event-date">
							{ formatted_date } { formatted_time }
						</div>
						{ location }
					</div>
					{ url && (
						<ExternalLink
							icon
							showIconFirst
							href={ url }
							className="community-events__event-link"
							onClick={ this.recordExternalEventLinkClick }
							target="_blank"
						>
							{ this.props.translate( 'Details' ) }
						</ExternalLink>
					) }
				</div>
			</CompactCard>
		);
	}
}

export default localize( CommunityEvent );
