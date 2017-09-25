/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import OrderDetailsTable from '../order-details/table';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import Notice from 'components/notice';
import formatCurrency from 'lib/format-currency';
import PriceInput from 'woocommerce/components/price-input';
import { updateOrder } from 'woocommerce/state/sites/orders/actions';
import { sendRefund } from 'woocommerce/state/sites/orders/refunds/actions';
import { fetchPaymentMethods } from 'woocommerce/state/sites/payment-methods/actions';
import { arePaymentMethodsLoaded, getPaymentMethod } from 'woocommerce/state/sites/payment-methods/selectors';

class OrderPaymentCard extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
			payment_method_title: PropTypes.string.isRequired,
			refunds: PropTypes.array.isRequired,
			status: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	}

	state = {
		errorMessage: false,
		refundTotal: 0,
		refundNote: '',
		showDialog: false,
	}

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchPaymentMethods( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;
		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchPaymentMethods( newSiteId );
		}
	}

	getRefundedTotal = ( order ) => {
		return order.refunds.reduce( ( sum, i ) => sum + parseFloat( i.total ), 0 );
	}

	getPaymentStatus = () => {
		const { order, translate } = this.props;
		let paymentStatus;

		if ( 'refunded' === order.status ) {
			paymentStatus = translate( 'Payment of %(total)s has been refunded', {
				args: {
					total: formatCurrency( order.total, order.currency ),
				}
			} );
		} else if ( 'on-hold' === order.status || 'pending' === order.status ) {
			paymentStatus = translate( 'Awaiting payment of %(total)s via %(method)s', {
				args: {
					total: formatCurrency( order.total, order.currency ),
					method: order.payment_method_title,
				}
			} );
		} else if ( order.refunds.length ) {
			const refund = this.getRefundedTotal( order );
			paymentStatus = translate( 'Payment of %(total)s has been partially refunded %(refund)s', {
				args: {
					total: formatCurrency( order.total, order.currency ),
					refund: formatCurrency( refund, order.currency ),
				}
			} );
		} else {
			paymentStatus = translate( 'Payment of %(total)s received via %(method)s', {
				args: {
					total: formatCurrency( order.total, order.currency ),
					method: order.payment_method_title,
				}
			} );
		}
		return paymentStatus;
	}

	getPaymentAction = () => {
		const { order, translate } = this.props;
		if ( 'refunded' === order.status ) {
			return null;
		} else if ( 'on-hold' === order.status || 'pending' === order.status ) {
			return (
				<Button onClick={ this.markAsPaid }>{ translate( 'Mark as Paid' ) }</Button>
			);
		}
		return (
			<Button onClick={ this.toggleDialog }>{ translate( 'Submit Refund' ) }</Button>
		);
	}

	markAsPaid = () => {
		const { order, siteId } = this.props;
		this.props.updateOrder( siteId, { ...order, status: 'processing' } );
	}

	toggleDialog = () => {
		this.setState( {
			errorMessage: false,
			refundTotal: 0,
			refundNote: '',
			showDialog: ! this.state.showDialog,
		} );
	}

	recalculateRefund = ( total ) => {
		this.setState( { refundTotal: total } );
	}

	updateNote = ( event ) => {
		this.setState( {
			refundNote: event.target.value,
		} );
	}

	sendRefund = () => {
		const { order, paymentMethod, site, translate } = this.props;
		const maxRefund = parseFloat( order.total ) + this.getRefundedTotal( order );
		if ( this.state.refundTotal > maxRefund ) {
			this.setState( { errorMessage: translate( 'Refund must be less than or equal to the order total.' ) } );
			return;
		} else if ( this.state.refundTotal <= 0 ) {
			this.setState( { errorMessage: translate( 'Refund must be greater than zero.' ) } );
			return;
		}
		this.toggleDialog();
		const refundObj = {
			amount: this.state.refundTotal + '', // API expects a string
			reason: this.state.refundNote,
			api_refund: ( paymentMethod && ( -1 !== paymentMethod.method_supports.indexOf( 'refunds' ) ) ),
		};
		this.props.sendRefund( site.ID, order.id, refundObj );
	}

	renderCreditCard = () => {
		const { isPaymentLoading, paymentMethod, translate } = this.props;
		if ( isPaymentLoading ) {
			return null;
		}

		if ( paymentMethod && ( -1 === paymentMethod.method_supports.indexOf( 'refunds' ) ) ) {
			return (
				<div className="order-payment__method">
					<h3>{ translate( 'Manual Refund' ) }</h3>
					<p>{ translate( 'This payment method doesn\'t support automated refunds and must be submitted manually.' ) }</p>
				</div>
			);
		}

		return (
			<div className="order-payment__method">
				<h3>
					{ translate( 'Refunding payment via %(method)s', {
						args: {
							method: paymentMethod.title,
						}
					} ) }
				</h3>
			</div>
		);
	}

	render() {
		const { isPaymentLoading, order, site, translate } = this.props;
		const { errorMessage, refundNote, showDialog } = this.state;
		const dialogClass = 'woocommerce'; // eslint/css specificity hack

		if ( 'cancelled' === order.status || 'failed' === order.status ) {
			return null;
		}

		let refundTotal = formatCurrency( 0, order.currency );
		if ( this.state.refundTotal ) {
			refundTotal = formatCurrency( this.state.refundTotal, order.currency );
		}
		refundTotal = refundTotal.replace( /[^0-9.,]/g, '' );

		const dialogButtons = [
			<Button onClick={ this.toggleDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.sendRefund } disabled={ isPaymentLoading }>{ translate( 'Refund' ) }</Button>,
		];

		return (
			<div className="order-payment">
				<div className="order-payment__label">
					<Gridicon icon="checkmark" />
					{ this.getPaymentStatus() }
				</div>
				<div className="order-payment__action">
					{ this.getPaymentAction() }
				</div>

				<Dialog
					isVisible={ showDialog }
					onClose={ this.toggleDialog }
					className={ dialogClass }
					buttons={ dialogButtons }
					additionalClassNames="order-payment__dialog woocommerce">
					<h1>{ translate( 'Refund order' ) }</h1>
					<OrderDetailsTable order={ order } isEditable onChange={ this.recalculateRefund } site={ site } />
					<form className="order-payment__container">
						<FormLabel className="order-payment__note">
							{ translate( 'Refund note' ) }
							<FormTextarea onChange={ this.updateNote } name="refund_note" value={ refundNote } />
						</FormLabel>

						<FormFieldset className="order-payment__details">
							<FormLabel className="order-payment__amount">
								<span className="order-payment__amount-label">{ translate( 'Total refund amount' ) }</span>
								<div className="order-payment__amount-value">
									<PriceInput
										name="refund_total"
										readOnly
										currency={ order.currency }
										value={ refundTotal } />
								</div>
							</FormLabel>

							{ this.renderCreditCard() }
						</FormFieldset>

						{ errorMessage && <Notice status="is-error" showDismiss={ false }>{ errorMessage }</Notice> }
					</form>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const paymentMethod = getPaymentMethod( state, props.order.payment_method );
		const isPaymentLoading = ! arePaymentMethodsLoaded( state );
		return {
			isPaymentLoading,
			paymentMethod,
		};
	},
	dispatch => bindActionCreators( { fetchPaymentMethods, sendRefund, updateOrder }, dispatch )
)( localize( OrderPaymentCard ) );
