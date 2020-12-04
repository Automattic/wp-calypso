/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import OrderEvents from './events';
import CreateOrderNote from './new-note';
import SectionHeader from 'calypso/components/section-header';

class OrderActivityLog extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	render() {
		const { orderId, siteId, translate } = this.props;

		return (
			<div className="order-activity-log">
				<SectionHeader label={ translate( 'Activity log' ) } />
				<Card>
					<OrderEvents orderId={ orderId } siteId={ siteId } />
					<CreateOrderNote orderId={ orderId } siteId={ siteId } />
				</Card>
			</div>
		);
	}
}

export default localize( OrderActivityLog );
