/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { sortBy, keys } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isActivityLogLoaded,
	getActivityLogEvents,
} from 'woocommerce/state/sites/orders/activity-log/selectors';
import Card from 'components/card';
import Event from './event';
import EventsByDay from './day';
import SectionHeader from 'components/section-header';

function getSortedEvents( events ) {
	const eventsByDay = {};
	events.forEach( event => {
		const day = moment( event.timestamp ).format( 'YYYYMMDD' );
		if ( eventsByDay[ day ] ) {
			eventsByDay[ day ].push( event );
		} else {
			eventsByDay[ day ] = [ event ];
		}
	} );

	keys( eventsByDay ).forEach( day => {
		eventsByDay[ day ] = sortBy( eventsByDay[ day ], 'timestamp' ).reverse();
	} );
	return eventsByDay;
}

class ActivityLog extends Component {
	static propTypes = {
		isLoaded: PropTypes.bool.isRequired,
		events: PropTypes.arrayOf( PropTypes.object ).isRequired,
		days: PropTypes.arrayOf( PropTypes.string ).isRequired,
		eventsByDay: PropTypes.objectOf( PropTypes.array ).isRequired,
	}

	constructor( props ) {
		super( props );
		this.state = {
			openIndex: 0,
		};
	}

	toggleOpenDay = ( index ) => {
		this.setState( () => ( { openIndex: index } ) );
	}

	renderEvents = () => {
		const { days, eventsByDay, translate } = this.props;
		if ( ! days.length ) {
			return (
				<p>{ translate( 'No activity yet' ) }</p>
			);
		}

		return days.map( ( day, index ) => {
			const events = eventsByDay[ day ];
			return (
				<EventsByDay
					key={ day }
					count={ events.length }
					date={ day }
					index={ index }
					isOpen={ index === this.state.openIndex }
					onClick={ this.toggleOpenDay } >
					{ events.map( event => (
						<Event
							key={ `${ event.type }-${ event.key }` }
							event={ event }
							orderId={ this.props.orderId }
							siteId={ this.props.siteId }
						/>
					) ) }
				</EventsByDay>
			);
		} );
	}

	renderPlaceholder = () => {
		const noop = () => {};
		return (
			<EventsByDay count={ 0 } date="" isOpen={ true } index={ 1 } onClick={ noop }>
				<Event />
			</EventsByDay>
		);
	}

	render() {
		const { isLoaded, translate } = this.props;
		const classes = classNames( {
			'is-placeholder': ! isLoaded
		} );

		return (
			<div className="activity-log">
				<SectionHeader label={ translate( 'Activity Log' ) } />
				<Card className={ classes }>
					{ isLoaded
						? this.renderEvents()
						: this.renderPlaceholder()
					}
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const orderId = props.orderId || false;

		const isLoaded = isActivityLogLoaded( state, orderId );
		const events = getActivityLogEvents( state, orderId );

		const eventsByDay = events.length ? getSortedEvents( events ) : {};
		const days = eventsByDay ? keys( eventsByDay ) : [];
		days.sort().reverse();

		return {
			isLoaded,
			days,
			events,
			eventsByDay,
		};
	}
)( localize( ActivityLog ) );
