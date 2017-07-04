/**
 * External dependencies
 */
import { find } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormSelect from 'components/forms/form-select';
import OrderDetailsTable from './order-details-table';
import OrderRefundCard from './order-refund-card';
import SectionHeader from 'components/section-header';

class OrderDetails extends Component {
	static propTypes = {
		onUpdate: PropTypes.func,
		order: PropTypes.object.isRequired,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	}

	state = {
		status: this.props.order.status || false,
	}

	updateStatus = ( event ) => {
		this.setState( { status: event.target.value } );
		// Send the order back to the parent component
		this.props.onUpdate( { status: event.target.value } );
	}

	renderStatus = () => {
		const { order, translate } = this.props;
		const classes = `order__status is-${ order.status }`;
		const statuses = [ {
			value: 'pending',
			name: translate( 'Pending payment' ),
		}, {
			value: 'processing',
			name: translate( 'Processing' ),
		}, {
			value: 'on-hold',
			name: translate( 'On Hold' ),
		}, {
			value: 'completed',
			name: translate( 'Completed' ),
		}, {
			value: 'cancelled',
			name: translate( 'Cancelled' ),
		}, {
			value: 'refunded',
			name: translate( 'Refunded' ),
		}, {
			value: 'failed',
			name: translate( 'Payment Failed' ),
		} ];

		if ( 'pending' === order.status || 'on-hold' === order.status ) {
			return (
				<FormSelect id="select" value={ this.state.status } onChange={ this.updateStatus }>
					{ statuses.map( ( status, i ) => {
						return (
							<option key={ i } value={ status.value }>{ status.name }</option>
						);
					} ) }
				</FormSelect>
			);
		}

		const statusLabel = find( statuses, { value: order.status } );
		return (
			<span className={ classes }>{ statusLabel.name }</span>
		);
	}

	render() {
		const { order, site, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order__details">
				<SectionHeader label={ translate( 'Order Details' ) }>
					<span>{ this.renderStatus() }</span>
				</SectionHeader>
				<Card className="order__details-card">
					<OrderDetailsTable order={ order } site={ site } />
					<OrderRefundCard order={ order } site={ site } />

					<div className="order__details-fulfillment">
						<div className="order__details-fulfillment-label">
							<Gridicon icon="shipping" />
							{ translate( 'Order needs to be fulfilled' ) }
						</div>
						<div className="order__details-fulfillment-action">
							<Button primary>{ translate( 'Print label' ) }</Button>
						</div>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( OrderDetails );
