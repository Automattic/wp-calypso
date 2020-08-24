/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { EVENT_TYPES } from 'woocommerce/state/sites/orders/activity-log/selectors';
import LabelItem from 'woocommerce/woocommerce-services/views/shipping-label/label-item';
import LabelItemInProgress from 'woocommerce/woocommerce-services/views/shipping-label/label-item-in-progress';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { withLocalizedMoment } from 'components/localized-moment';

class OrderEvent extends Component {
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
		[ EVENT_TYPES.INTERNAL_NOTE ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'aside',
				// @todo Add comment author once we have that info
				heading: translate( 'Internal note' ),
				content: decodeEntities( stripHTML( event.content ) ),
			};
		},

		[ EVENT_TYPES.CUSTOMER_NOTE ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'mail',
				// @todo Add comment author once we have that info
				heading: translate( 'Note sent to customer' ),
				content: decodeEntities( stripHTML( event.content ) ),
			};
		},

		[ EVENT_TYPES.LABEL_PURCHASING ]: ( event ) => {
			return {
				icon: 'sync',
				content: (
					<LabelItemInProgress
						label={ event }
						orderId={ this.props.orderId }
						siteId={ this.props.siteId }
					/>
				),
			};
		},

		[ EVENT_TYPES.LABEL_PURCHASED ]: ( event ) => {
			return {
				icon: 'print',
				content: (
					<LabelItem label={ event } orderId={ this.props.orderId } siteId={ this.props.siteId } />
				),
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_REQUESTED ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'time',
				content: (
					<div>
						{ translate( '%(service)s label (#%(labelNum)d) refund requested (%(amount)s)', {
							args: {
								service: event.serviceName,
								labelNum: event.labelIndex + 1,
								amount: formatCurrency( event.amount, event.currency ),
							},
						} ) }
					</div>
				),
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_COMPLETED ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'refund',
				content: (
					<div>
						{ translate( '%(service)s label (#%(labelNum)d) refunded (%(amount)s)', {
							args: {
								service: event.serviceName,
								labelNum: event.labelIndex + 1,
								amount: formatCurrency( event.amount, event.currency ),
							},
						} ) }
					</div>
				),
			};
		},

		[ EVENT_TYPES.LABEL_REFUND_REJECTED ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'cross-small',
				content: (
					<div>
						{ translate( '%(service)s label (#%(labelNum)d) refund rejected', {
							service: event.serviceName,
							args: { labelNum: event.labelIndex + 1 },
						} ) }
					</div>
				),
			};
		},

		[ EVENT_TYPES.REFUND_NOTE ]: ( event ) => {
			const { translate } = this.props;
			return {
				icon: 'credit-card',
				heading: translate( 'Refund' ),
				content: (
					<div>
						{ translate( 'Refunded %(amount)s', {
							args: {
								amount: formatCurrency( event.amount, event.currency ),
							},
						} ) }
						<br />
						{ event.reason }
					</div>
				),
			};
		},

		//render the loading placeholder without props
		[ undefined ]: () => ( {} ),
	};

	renderDefaultEvent = ( event ) => {
		const { translate } = this.props;
		return {
			icon: 'aside',
			heading: translate( 'Note' ),
			content: event.content,
		};
	};

	render() {
		const { moment, event } = this.props;
		const renderEvent = this.eventPropsByType[ event.type ] || this.renderDefaultEvent;
		const { icon, heading, content } = renderEvent( event );

		return (
			<div className="order-activity-log__note">
				<div className="order-activity-log__note-meta">
					<span className="order-activity-log__note-time">
						{ moment( event.timestamp ).format( 'LT' ) }
					</span>
					{ icon && <Gridicon icon={ icon } size={ 24 } /> }
				</div>
				<div className="order-activity-log__note-body">
					<div className="order-activity-log__note-type">{ heading }</div>
					<div className="order-activity-log__note-content">{ content }</div>
				</div>
			</div>
		);
	}
}

export default localize( withLocalizedMoment( OrderEvent ) );
