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
import { areOrderNotesLoaded, getOrderNotes } from 'woocommerce/state/sites/orders/notes/selectors';
import Card from 'components/card';
import OrderNote from './note';
import EventsByDay from './day';
import SectionHeader from 'components/section-header';

function getSortedEvents( events ) {
	const eventsByDay = {};
	events.forEach( event => {
		const day = moment( event.date ).format( 'YYYYMMDD' );
		if ( eventsByDay[ day ] ) {
			eventsByDay[ day ].push( event );
			eventsByDay[ day ] = sortBy( eventsByDay[ day ], 'date' ).reverse();
		} else {
			eventsByDay[ day ] = [ event ];
		}
	} );
	return eventsByDay;
}

class ActivityLog extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
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
					{ events.map( event => {
						if ( event.type === 'order-note' ) {
							return <OrderNote { ...event } key={ event.id } />;
						}
					} ) }
				</EventsByDay>
			);
		} );
	}

	renderPlaceholder = () => {
		const noop = () => {};
		return (
			<EventsByDay count={ 0 } date="" isOpen={ true } index={ 1 } onClick={ noop }>
				<OrderNote note="" />
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
		const siteId = props.siteId || false;
		const isLoaded = areOrderNotesLoaded( state, orderId );

		const notes = getOrderNotes( state, orderId );
		const events = notes.map( ( note ) => {
			return {
				...note,
				type: 'order-note',
				date: note.date_created,
			}
		} );

		const eventsByDay = events.length ? getSortedEvents( events ) : false;
		const days = eventsByDay ? keys( eventsByDay ) : [];
		days.sort().reverse();

		return {
			isLoaded,
			days,
			events,
			eventsByDay,
			orderId,
			siteId,
		};
	}
)( localize( ActivityLog ) );
