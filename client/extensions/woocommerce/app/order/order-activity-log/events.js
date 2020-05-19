/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { keys, last, noop, sortBy } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	isActivityLogLoaded,
	getActivityLogEvents,
} from 'woocommerce/state/sites/orders/activity-log/selectors';
import OrderEvent from './event';
import OrderEventsByDay from './day';

function getSortedEvents( events ) {
	const eventsByDay = {};
	events.forEach( ( event ) => {
		const day = moment( event.timestamp ).format( 'YYYYMMDD' );
		if ( eventsByDay[ day ] ) {
			eventsByDay[ day ].push( event );
		} else {
			eventsByDay[ day ] = [ event ];
		}
	} );

	keys( eventsByDay ).forEach( ( day ) => {
		eventsByDay[ day ] = sortBy( eventsByDay[ day ], [ 'timestamp', 'key' ] ).reverse();
	} );
	return eventsByDay;
}

class OrderEvents extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	UNSAFE_componentWillMount() {
		this.setState( { openDay: last( keys( this.props.eventsByDay ) ) } );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const newOpenDay = last( keys( nextProps.eventsByDay ) );
		//if a new latest day has been appended, open it
		if ( ! this.props.eventsByDay[ newOpenDay ] ) {
			this.setState( { openDay: newOpenDay } );
		}
	}

	toggleOpenDay = ( date ) => {
		this.setState( () => ( { openDay: date } ) );
	};

	renderNotes = () => {
		const { days, eventsByDay, translate } = this.props;
		if ( ! days.length ) {
			return <p>{ translate( 'No activity yet' ) }</p>;
		}

		return (
			<div>
				{ days.map( ( day ) => {
					const events = eventsByDay[ day ];
					return (
						<OrderEventsByDay
							key={ day }
							count={ events.length }
							date={ day }
							isOpen={ day === this.state.openDay }
							onClick={ this.toggleOpenDay }
						>
							{ events.map( ( event ) => (
								<OrderEvent
									key={ `${ event.type }-${ event.key }` }
									event={ event }
									orderId={ this.props.orderId }
									siteId={ this.props.siteId }
								/>
							) ) }
						</OrderEventsByDay>
					);
				} ) }
			</div>
		);
	};

	renderPlaceholder = () => {
		const placeholderClassName = 'is-placeholder';
		return (
			<div className={ placeholderClassName }>
				<OrderEventsByDay count={ 0 } date="" isOpen={ true } index={ 1 } onClick={ noop }>
					<OrderEvent />
				</OrderEventsByDay>
			</div>
		);
	};

	render() {
		return this.props.isLoaded ? this.renderNotes() : this.renderPlaceholder();
	}
}

export default connect( ( state, props ) => {
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
} )( localize( OrderEvents ) );
