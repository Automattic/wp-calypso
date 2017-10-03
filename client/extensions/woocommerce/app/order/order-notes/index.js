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
import { areOrderNotesLoaded, getOrderNotes } from 'woocommerce/state/sites/orders/notes/selectors';
import Card from 'components/card';
import CreateOrderNote from './new-note';
import OrderNote from './note';
import OrderNotesByDay from './day';
import SectionHeader from 'components/section-header';

function getSortedNotes( notes ) {
	const notesByDay = {};
	notes.forEach( note => {
		const day = moment( note.date_created_gmt ).format( 'YYYYMMDD' );
		if ( notesByDay[ day ] ) {
			notesByDay[ day ].push( note );
			notesByDay[ day ] = sortBy( notesByDay[ day ], 'date_created' ).reverse();
		} else {
			notesByDay[ day ] = [ note ];
		}
	} );
	return notesByDay;
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
		const { days, notesByDay, translate } = this.props;
		if ( ! days.length ) {
			return <p>{ translate( 'No activity yet' ) }</p>;
		}

		return days.map( ( day, index ) => {
			const notes = notesByDay[ day ];
			return (
				<OrderNotesByDay
					key={ day }
					count={ notes.length }
					date={ day }
					index={ index }
					isOpen={ index === this.state.openIndex }
					onClick={ this.toggleOpenDay }
				>
					{ notes.map( note => <OrderNote { ...note } key={ note.id } /> ) }
				</OrderNotesByDay>
			);
		} );
	};

	renderPlaceholder = () => {
		const noop = () => {};
		return (
			<OrderNotesByDay count={ 0 } date="" isOpen={ true } index={ 1 } onClick={ noop }>
				<OrderNote note="" />
			</OrderNotesByDay>
		);
	};

	render() {
		const { areNotesLoaded, orderId, siteId, translate } = this.props;
		const classes = classNames( {
			'is-placeholder': ! areNotesLoaded,
		} );

		return (
			<div className="order-notes">
				<SectionHeader label={ translate( 'Activity Log' ) } />
				<Card className={ classes }>
					{ areNotesLoaded ? this.renderNotes() : this.renderPlaceholder() }
					<CreateOrderNote orderId={ orderId } siteId={ siteId } />
				</Card>
			</div>
		);
	}
}

export default connect( ( state, props ) => {
	const orderId = props.orderId || false;
	const siteId = props.siteId || false;
	const areNotesLoaded = areOrderNotesLoaded( state, orderId );
	const notes = getOrderNotes( state, orderId );
	const notesByDay = notes.length ? getSortedNotes( notes ) : false;
	const days = notesByDay ? keys( notesByDay ) : [];
	days.sort().reverse();

	return {
		areNotesLoaded,
		days,
		notes,
		notesByDay,
		orderId,
		siteId,
	};
} )( localize( OrderNotes ) );
