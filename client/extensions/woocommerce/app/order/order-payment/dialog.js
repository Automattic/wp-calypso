/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find, map, sum } from 'lodash';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import {
	arePaymentMethodsLoaded,
	getPaymentMethod,
} from 'woocommerce/state/sites/payment-methods/selectors';
import { Button, Dialog } from '@automattic/components';
import { fetchPaymentMethods } from 'woocommerce/state/sites/payment-methods/actions';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import { getCurrencyFormatDecimal } from 'woocommerce/lib/currency';
import {
	getOrderFeeTax,
	getOrderLineItemTax,
	getOrderShippingTax,
} from 'woocommerce/lib/order-values';
import { getOrderRefundTotal } from 'woocommerce/lib/order-values/totals';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Notice from 'components/notice';
import OrderRefundTable from './table';
import { sendRefund } from 'woocommerce/state/sites/orders/refunds/actions';

class RefundDialog extends Component {
	static propTypes = {
		isPaymentLoading: PropTypes.bool,
		fetchPaymentMethods: PropTypes.func.isRequired,
		isVisible: PropTypes.bool.isRequired,
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
			refunds: PropTypes.array.isRequired,
			status: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
		paymentMethod: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		sendRefund: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		toggleDialog: PropTypes.func,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			refundTotal: this.getInitialRefund(),
			refundNote: '',
		};
	}

	componentDidMount = () => {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchPaymentMethods( siteId );
		}
	};

	UNSAFE_componentWillReceiveProps = ( newProps ) => {
		const newSiteId = newProps.siteId;
		const oldSiteId = this.props.siteId;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchPaymentMethods( newSiteId );
		}
		// Has been opened and closed before, let's reset the values.
		if ( newProps.isVisible && ! this.props.isVisible ) {
			this.setState( {
				refundTotal: this.getInitialRefund(),
				refundNote: '',
			} );
		}
	};

	toggleDialog = () => {
		this.props.toggleDialog();
	};

	getInitialRefund = () => {
		const { order } = this.props;
		return (
			sum(
				order.fee_lines.map( ( item ) => {
					return parseFloat( item.total ) + parseFloat( getOrderFeeTax( order, item.id ) );
				} )
			) +
			parseFloat( getOrderShippingTax( order ) ) +
			parseFloat( order.shipping_total )
		);
	};

	recalculateRefund = ( data ) => {
		const { order } = this.props;
		if ( ! order ) {
			return 0;
		}
		const subtotal = sum( [
			...map( data.fees, parseFloat ),
			...map( data.quantities, ( q, id ) => {
				id = parseInt( id );
				const line_item = find( order.line_items, { id } );
				if ( ! line_item ) {
					return 0;
				}

				const price = parseFloat( line_item.price );
				if ( order.prices_include_tax ) {
					return price * q;
				}

				const tax = getOrderLineItemTax( order, id ) / line_item.quantity;
				return ( price + tax ) * q;
			} ),
		] );
		const total = subtotal + ( parseFloat( data.shippingTotal ) || 0 );
		return total;
	};

	recalculateAndSetState = ( data ) => {
		this.setState( { refundTotal: this.recalculateRefund( data ) } );
	};

	isRefundInvalid = ( thisRefund ) => {
		const { order, translate } = this.props;
		// Refund total is negative, so this effectively subtracts the refund from total.
		const maxRefund = parseFloat( order.total ) + getOrderRefundTotal( order );
		if ( thisRefund > maxRefund ) {
			return translate( 'Refund must be less than or equal to the order balance.' );
		} else if ( thisRefund <= 0 ) {
			return translate( 'Refund must be greater than zero.' );
		}
		return false;
	};

	updateNote = ( event ) => {
		this.setState( {
			refundNote: event.target.value,
		} );
	};

	sendRefund = () => {
		const { order, paymentMethod, siteId } = this.props;
		// Refund total is negative, so this effectively subtracts the refund from total.
		const thisRefund = getCurrencyFormatDecimal( this.state.refundTotal, order.currency );
		this.toggleDialog();
		const refundObj = {
			amount: thisRefund.toPrecision(),
			reason: this.state.refundNote,
			api_refund: paymentMethod && -1 !== paymentMethod.method_supports.indexOf( 'refunds' ),
		};
		this.props.sendRefund( siteId, order.id, refundObj );
	};

	renderCreditCard = () => {
		const { isPaymentLoading, paymentMethod, translate } = this.props;
		if ( isPaymentLoading ) {
			return null;
		}

		if ( paymentMethod && -1 === paymentMethod.method_supports.indexOf( 'refunds' ) ) {
			return (
				<div className="order-payment__method">
					<h3>{ translate( 'Manual Refund' ) }</h3>
					<p>
						{ translate(
							'This payment method does not support automated refunds. ' +
								'After recording the refund here, you must remit the amount to the customer manually.'
						) }
					</p>
				</div>
			);
		}

		return (
			<div className="order-payment__method">
				<h3>
					{ translate( 'Refunding payment via %(method)s', {
						args: {
							method: paymentMethod.title,
						},
					} ) }
				</h3>
			</div>
		);
	};

	render() {
		const { isPaymentLoading, order, isVisible, translate } = this.props;
		const { refundNote } = this.state;
		const dialogClass = 'woocommerce'; // eslint/css specificity hack

		let refundTotal = getCurrencyFormatDecimal( 0, order.currency );
		if ( this.state.refundTotal ) {
			refundTotal = getCurrencyFormatDecimal( this.state.refundTotal, order.currency );
		}

		const errorMessage = this.isRefundInvalid( refundTotal );
		const refundDisabled = isPaymentLoading || !! errorMessage;

		const dialogButtons = [
			<Button onClick={ this.toggleDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.sendRefund } disabled={ refundDisabled }>
				{ translate( 'Refund', { context: 'Action label for button' } ) }
			</Button>,
		];

		if ( errorMessage ) {
			dialogButtons.unshift(
				<Notice status="is-error" showDismiss={ false } isCompact>
					{ errorMessage }
				</Notice>
			);
		}

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ this.toggleDialog }
				className={ dialogClass }
				buttons={ dialogButtons }
				additionalClassNames="order-payment__dialog woocommerce"
			>
				<h1>{ translate( 'Refund order' ) }</h1>
				<OrderRefundTable order={ order } onChange={ this.recalculateAndSetState } />
				<form className="order-payment__container">
					<FormLabel className="order-payment__note">
						{ translate( 'Refund note', { comment: "Label for refund's comment field" } ) }
						<FormTextarea onChange={ this.updateNote } name="refund_note" value={ refundNote } />
					</FormLabel>

					<div className="order-payment__details">
						<div className="order-payment__amount">
							<span className="order-payment__amount-label">
								{ translate( 'Total refund amount' ) }
							</span>
							<span className="order-payment__amount-value">
								{ formatCurrency( refundTotal, order.currency ) }
							</span>
						</div>

						{ this.renderCreditCard() }
					</div>
				</form>
			</Dialog>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const paymentMethod = getPaymentMethod( state, props.order.payment_method );
		const isPaymentLoading = ! arePaymentMethodsLoaded( state );
		return {
			isPaymentLoading,
			paymentMethod,
			siteId,
		};
	},
	( dispatch ) => bindActionCreators( { fetchPaymentMethods, sendRefund }, dispatch )
)( localize( RefundDialog ) );
