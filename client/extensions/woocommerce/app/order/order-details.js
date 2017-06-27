/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import OrderDetailsTable from './order-details-table';
import OrderRefundCard from './order-refund-card';
import SectionHeader from 'components/section-header';

class OrderDetails extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			discount_total: PropTypes.string.isRequired,
			line_items: PropTypes.array.isRequired,
			payment_method_title: PropTypes.string.isRequired,
			shipping_total: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	}

	state = {
		showRefundDialog: false,
	}

	toggleRefundDialog = () => {
		this.setState( {
			showRefundDialog: ! this.state.showRefundDialog,
		} );
	}

	render() {
		const { order, site, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order__details">
				<SectionHeader label={ translate( 'Order Details' ) } />
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
