/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { EVENT_TYPES } from 'woocommerce/state/sites/orders/activity-log/selectors';
import LabelItem from 'woocommerce/woocommerce-services/views/shipping-label/label-item';
import { decodeEntities, stripHTML } from 'lib/formatting';
import formatCurrency from 'lib/format-currency';

class OrderNote extends Component {
	static propTypes = {
		customer_note: PropTypes.bool,
		date_created_gmt: PropTypes.string,
		note: PropTypes.string.isRequired,
	};

	static propTypes = {
		event: PropTypes.object,
	};

	static defaultProps = {
		event: {},
	};

	eventPropsByType = {
		[ EVENT_TYPES.INTERNAL_NOTE ]: event => {
			const { translate } = this.props;
			return {
				icon: 'aside',
				// @todo Add comment author once we have that info
				heading: translate( 'Internal note' ),
				content: decodeEntities( stripHTML( event.content ) ),
			};
		},

		[ EVENT_TYPES.CUSTOMER_NOTE ]: event => {
			const { translate } = this.props;
			return {
				icon: 'mail',
				// @todo Add comment author once we have that info
				heading: translate( 'Note sent to customer' ),
				content: decodeEntities( stripHTML( event.content ) ),
			};
		},

		[ EVENT_TYPES.LABEL_PURCHASED ]: event => {
			return {
				icon: 'print',
				content: (
					<LabelItem label={ event } orderId={ this.props.orderId } siteId={ this.props.siteId } />
				),
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_REQUESTED ]: event => {
			return {
				icon: 'time',
				content: (
					<div>
						<span>Label #{ event.labelIndex + 1 } refund requested</span>
						{ event.amount != null ? (
							<span> ({ formatCurrency( event.amount, event.currency ) })</span>
						) : null }
					</div>
				),
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_COMPLETED ]: event => {
			return {
				icon: 'refund',
				content: (
					<div>
						Label #{ event.labelIndex + 1 } refunded ({ formatCurrency( event.amount, event.currency ) })
					</div>
				),
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_REJECTED ]: event => {
			return {
				icon: 'cross-small',
				content: <div>Label #{ event.labelIndex + 1 } refund rejected</div>,
			};
		},

		[ undefined ]: () => ( {} ),
	};

	render() {
		const { moment, event } = this.props;
		const { icon, heading, content } = this.eventPropsByType[ event.type ]( event );

		return (
			<div className="order-notes__note">
				<div className="order-notes__note-meta">
					<span className="order-notes__note-time">
						{ moment( event.timestamp ).format( 'LT' ) }
					</span>
					{ icon && <Gridicon icon={ icon } size={ 24 } /> }
				</div>
				<div className="order-notes__note-body">
					<div className="order-notes__note-type">{ heading }</div>
					<div className="order-notes__note-content">{ content }</div>
				</div>
			</div>
		);
	}
}

export default localize( OrderNote );
