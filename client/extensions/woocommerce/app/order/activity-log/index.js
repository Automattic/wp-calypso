/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { sortBy, keys } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	isActivityLogLoaded,
	getActivityLogEvents,
	EVENT_TYPES,
} from 'woocommerce/state/sites/orders/activity-log/selectors';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
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

	eventPropsByType = {
		[ EVENT_TYPES.INTERNAL_NOTE ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'aside',
				// @todo Add comment author once we have that info
				heading: translate( 'Internal note' ),
				timestamp: event.timestamp,
				children: decodeEntities( stripHTML( event.content ) ),
			};
		},

		[ EVENT_TYPES.CUSTOMER_NOTE ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'mail',
				// @todo Add comment author once we have that info
				heading: translate( 'Note sent to customer' ),
				timestamp: event.timestamp,
				children: decodeEntities( stripHTML( event.content ) ),
			};
		},

		[ EVENT_TYPES.LABEL_PURCHASED ]: ( event ) => {
			// TODO const { translate } = this.props;
			return {
				icon: 'print',
				timestamp: event.timestamp,
				children:
					<div>
						<div>
							Label { event.labelIndex + 1 }
							<span> (for <span title={ event.productNames.join( '\n' ) }>{ event.packageName }</span>) </span>
							purchased
						</div>
						<div>Tracking #: { event.tracking }</div>
						{ ! event.showDetails
							? null
							: (
								<div>
									<ButtonGroup>
										<Button compact><Gridicon icon="print" /> Reprint</Button>
										<Button compact>
											<Gridicon icon="refund" /> Refund ({ event.currency } { event.refundableAmount })
										</Button>
									</ButtonGroup>
								</div>
							)
						}
					</div>,
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_REQUESTED ]: ( event ) => {
			return {
				icon: 'refund',
				timestamp: event.timestamp,
				children:
					<div>
						<span>Label { event.labelIndex + 1 } refund requested</span>
						{ event.amount != null ? <span> ({ event.currency } { event.amount })</span> : null }
					</div>,
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_COMPLETED ]: ( event ) => {
			return {
				icon: 'refund',
				timestamp: event.timestamp,
				children:
				<div>
					Label { event.labelIndex + 1 } refunded ({ event.currency } { event.amount })
				</div>,
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_REJECTED ]: ( event ) => {
			return {
				icon: 'refund',
				timestamp: event.timestamp,
				children:
				<div>
					Label { event.labelIndex + 1 } refund rejected
				</div>,
			};
		},
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
