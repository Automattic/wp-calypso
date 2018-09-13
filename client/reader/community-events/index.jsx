/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get, isEmpty, times } from 'lodash';

/**
 * Internal dependencies
 */
import CommunityEvent from './event';
import DocumentHead from 'components/data/document-head';
import EmptyCommunityEvents from './empty';
import EventPlaceholder from './placeholder';
import getCommunityEvents from 'state/selectors/get-community-events';
import getCommunityEventsError from 'state/selectors/get-community-events-error';
import isRequestingCommunityEvents from 'state/selectors/is-requesting-community-events';
import Main from 'components/main';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import { requestCommunityEvents } from 'state/community-events/actions';
import SectionHeader from 'components/section-header';

// TODO - maybe add item for this section in Reader to wordpress-com.js
// TODO - add WP News and input so the user can search for other locations

class CommunityEvents extends React.Component {
	static propTypes = {
		events: PropTypes.array,
		error: PropTypes.string,
		isLoading: PropTypes.bool,
	};

	static defaultProps = {
		isLoading: true,
	};

	componentDidMount() {
		this.props.requestCommunityEvents();
	}

	renderLoading() {
		const count = get( this.props, 'events.length' ) || 2;

		return times( count, i => {
			return <EventPlaceholder key={ 'community-event-placeholder-' + i } />;
		} );
	}

	renderEvents() {
		const { events } = this.props;

		if ( isEmpty( events ) ) {
			return <EmptyCommunityEvents />;
		}

		return events.map( event => {
			const { location, formatted_time } = event;
			return (
				<CommunityEvent key={ `${ location.location }:${ formatted_time }` } event={ event } />
			);
		} );
	}

	render() {
		const { isLoading, translate } = this.props;

		return (
			<Main className="community-events">
				<DocumentHead title={ 'Community Events' } />
				<MobileBackToSidebar>
					<h1>{ translate( 'Streams' ) }</h1>
				</MobileBackToSidebar>
				<SectionHeader label={ translate( 'Community Events Near You' ) } />
				<div className="community-events__events">
					{ isLoading && this.renderLoading() }
					{ ! isLoading && this.renderEvents() }
				</div>
			</Main>
		);
	}
}

const mapStateToProps = state => ( {
	events: getCommunityEvents( state ),
	isLoading: isRequestingCommunityEvents( state ),
	error: getCommunityEventsError( state ),
} );

const mapDispatchToProps = {
	requestCommunityEvents,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( CommunityEvents ) );
