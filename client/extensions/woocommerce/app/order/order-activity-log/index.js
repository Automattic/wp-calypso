/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { keys, last, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isActivityLogLoaded,
	getActivityLogEvents,
} from 'woocommerce/state/sites/orders/activity-log/selectors';
import Card from 'components/card';
import CreateOrderNote from './new-note';
import OrderEvent from './event';
import OrderEventsByDay from './day';
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
		eventsByDay[ day ] = sortBy( eventsByDay[ day ], [ 'timestamp', 'key' ] ).reverse();
	} );
	return eventsByDay;
}

class OrderActivityLog extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	componentWillMount() {
		this.setState( { openDay: last( keys( this.props.eventsByDay ) ) } );
	}

	componentWillReceiveProps( nextProps ) {
		const newOpenDay = last( keys( nextProps.eventsByDay ) );
		//if a new latest day has been appended, open it
		if ( ! this.props.eventsByDay[ newOpenDay ] ) {
			this.setState( { openDay: newOpenDay } );
		}
	}

	toggleOpenDay = date => {
		this.setState( () => ( { openDay: date } ) );
	};

	renderNotes = () => {
		const { days, eventsByDay, translate } = this.props;
		if ( ! days.length ) {
			return <p>{ translate( 'No activity yet' ) }</p>;
		}

		return days.map( day => {
			const events = eventsByDay[ day ];
			return (
				<OrderEventsByDay
					key={ day }
					count={ events.length }
					date={ day }
					isOpen={ day === this.state.openDay }
					onClick={ this.toggleOpenDay }
				>
					{ events.map( event => (
						<OrderEvent
							key={ `${ event.type }-${ event.key }` }
							event={ event }
							orderId={ this.props.orderId }
							siteId={ this.props.siteId }
						/>
					) ) }
				</OrderEventsByDay>
			);
		} );
	};

	renderPlaceholder = () => {
		const noop = () => {};
		return (
			<OrderEventsByDay count={ 0 } date="" isOpen={ true } index={ 1 } onClick={ noop }>
				<OrderEvent />
			</OrderEventsByDay>
		);
	};

	render() {
		const { isLoaded, orderId, siteId, translate } = this.props;
		const classes = classNames( {
			'is-placeholder': ! isLoaded,
		} );

		return (
			<div className="order-activity-log">
				<SectionHeader label={ translate( 'Activity Log' ) } />
				<Card className={ classes }>
					{ isLoaded ? this.renderNotes() : this.renderPlaceholder() }
					<CreateOrderNote orderId={ orderId } siteId={ siteId } />
				</Card>
			</div>
		);
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
} )( localize( OrderActivityLog ) );
