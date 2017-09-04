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
import { isLoaded as areLabelsLoaded, getLabels } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import Card from 'components/card';
import Event from './event';
import EventsByDay from './day';
import SectionHeader from 'components/section-header';
import { decodeEntities, stripHTML } from 'lib/formatting';

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

	eventPropsByType = {
		'order-note': ( event ) => {
			const { translate } = this.props;

			// @todo Add comment author once we have that info
			let icon = 'aside';
			let heading = translate( 'Internal note' );
			if ( event.data.customer_note ) {
				icon = 'mail';
				heading = translate( 'Note sent to customer' );
			}

			return {
				icon,
				heading,
				timestamp: event.timestamp && event.timestamp + 'Z',
				children: decodeEntities( stripHTML( event.data.note ) ),
			};
		},

		'shipping-label': ( event ) => ( {
			icon: 'print',
			timestamp: event.timestamp,
			children: 'A shipping label was purchased!',
		} ),
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
						const eventProps = this.eventPropsByType[ event.type ]( event );
						return <Event key={ `${ event.type }-${ event.key }` } { ...eventProps } />;
					} ) }
				</EventsByDay>
			);
		} );
	}

	renderPlaceholder = () => {
		const noop = () => {};
		return (
			<EventsByDay count={ 0 } date="" isOpen={ true } index={ 1 } onClick={ noop }>
				<Event note="" />
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
		const isLoaded = areOrderNotesLoaded( state, orderId ) && areLabelsLoaded( state, orderId );

		const events = [
			...getOrderNotes( state, orderId ).map( ( note ) => ( {
				type: 'order-note',
				timestamp: note.date_created_gmt,
				data: note,
				key: note.id,
			} ) ),

			// TODO split out refund events
			...getLabels( state, orderId ).map( ( label ) => ( {
				type: 'shipping-label',
				timestamp: new Date( label.created_date ).toISOString(),
				data: label,
				key: label.label_id,
			} ) ),
		];

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
