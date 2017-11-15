/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import OrderEvents from './events';
import CreateOrderNote from './new-note';
import SectionHeader from 'components/section-header';

class OrderActivityLog extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	render() {
		const { orderId, siteId, translate } = this.props;

		return (
			<div className="order-activity-log">
				<SectionHeader label={ translate( 'Activity Log' ) } />
				<Card>
					<OrderEvents orderId={ orderId } siteId={ siteId } />
					<CreateOrderNote orderId={ orderId } siteId={ siteId } />
				</Card>
			</div>
		);
	}
}

export default localize( OrderActivityLog );
