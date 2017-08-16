/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
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
import { fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
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
	}

	constructor( props ) {
		super( props );
		this.state = {
			openIndex: 0,
		};
	}

	componentDidMount() {
		const { siteId, orderId } = this.props;

		if ( siteId ) {
			this.props.fetchNotes( siteId, orderId );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.orderId !== this.props.orderId || newProps.siteId !== this.props.siteId ) {
			this.props.fetchNotes( newProps.siteId, newProps.orderId );
		}
	}

	toggleOpenDay = ( index ) => {
		this.setState( () => ( { openIndex: index } ) );
	}

	renderNotes = () => {
		const { days, notesByDay, translate } = this.props;
		if ( ! days.length ) {
			return (
				<p>{ translate( 'No activity yet' ) }</p>
			);
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
					onClick={ this.toggleOpenDay } >
					{ notes.map( note => <OrderNote { ...note } key={ note.id } /> ) }
				</OrderNotesByDay>
			);
		} );
	}

	render() {
		const { areNotesLoaded, translate } = this.props;

		return (
			<div className="order-notes">
				<SectionHeader label={ translate( 'Activity Log' ) } />
				<Card>
					{ areNotesLoaded
						? this.renderNotes()
						: translate( 'Loading…' )
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
	},
	dispatch => bindActionCreators( { fetchNotes }, dispatch )
)( localize( OrderNotes ) );
