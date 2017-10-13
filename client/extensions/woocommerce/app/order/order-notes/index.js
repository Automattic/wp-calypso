/** @format */
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
import CreateOrderNote from './new-note';
import OrderNote from './note';
import OrderNotesByDay from './day';
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

class OrderNotes extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			openIndex: 0,
		};
	}

	toggleOpenDay = index => {
		this.setState( () => ( { openIndex: index } ) );
	};

	renderNotes = () => {
		const { days, eventsByDay, translate } = this.props;
		if ( ! days.length ) {
			return <p>{ translate( 'No activity yet' ) }</p>;
		}

		return days.map( ( day, index ) => {
			const events = eventsByDay[ day ];
			return (
				<OrderNotesByDay
					key={ day }
					count={ events.length }
					date={ day }
					index={ index }
					isOpen={ index === this.state.openIndex }
					onClick={ this.toggleOpenDay }
				>
					{ events.map( event => (
						<OrderNote
							key={ `${ event.type }-${ event.key }` }
							event={ event }
							orderId={ this.props.orderId }
							siteId={ this.props.siteId }
						/>
					) ) }
				</OrderNotesByDay>
			);
		} );
	};

	renderPlaceholder = () => {
		const noop = () => {};
		return (
			<OrderNotesByDay count={ 0 } date="" isOpen={ true } index={ 1 } onClick={ noop }>
				<OrderNote />
			</OrderNotesByDay>
		);
	};

	render() {
		const { isLoaded, orderId, siteId, translate } = this.props;
		const classes = classNames( {
			'is-placeholder': ! isLoaded,
		} );

		return (
			<div className="order-notes">
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
} )( localize( OrderNotes ) );
