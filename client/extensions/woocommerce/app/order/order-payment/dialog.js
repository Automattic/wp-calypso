/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	arePaymentMethodsLoaded,
	getPaymentMethod,
} from 'woocommerce/state/sites/payment-methods/selectors';
import Button from 'components/button';
import Dialog from 'components/dialog';
import { fetchPaymentMethods } from 'woocommerce/state/sites/payment-methods/actions';
import formatCurrency from 'lib/format-currency';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Notice from 'components/notice';
import OrderRefundTable from './table';
import PriceInput from 'woocommerce/components/price-input';
import { sendRefund } from 'woocommerce/state/sites/orders/refunds/actions';

class OrderPaymentCard extends Component {
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

	state = {
		errorMessage: false,
		refundTotal: 0,
		refundNote: '',
	};

	componentDidMount = () => {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchPaymentMethods( siteId );
		}
	};

	componentWillReceiveProps = newProps => {
		const newSiteId = newProps.siteId;
		const oldSiteId = this.props.siteId;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchPaymentMethods( newSiteId );
		}
	};

	getRefundedTotal = order => {
		return order.refunds.reduce( ( sum, i ) => sum + parseFloat( i.total ), 0 );
	};

	toggleDialog = () => {
		this.setState( {
			errorMessage: false,
			refundTotal: 0,
			refundNote: '',
		} );
		this.props.toggleDialog();
	};

	recalculateRefund = total => {
		this.setState( { refundTotal: total } );
	};

	updateNote = event => {
		this.setState( {
			refundNote: event.target.value,
		} );
	};

	sendRefund = () => {
		const { order, paymentMethod, siteId, translate } = this.props;
		const maxRefund = parseFloat( order.total ) + this.getRefundedTotal( order );
		if ( this.state.refundTotal > maxRefund ) {
			this.setState( {
				errorMessage: translate( 'Refund must be less than or equal to the order total.' ),
			} );
			return;
		} else if ( this.state.refundTotal <= 0 ) {
			this.setState( { errorMessage: translate( 'Refund must be greater than zero.' ) } );
			return;
		}
		this.toggleDialog();
		const refundObj = {
			amount: this.state.refundTotal + '', // API expects a string
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
							"This payment method doesn't support automated refunds and must be submitted manually."
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
		const { errorMessage, refundNote } = this.state;
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
			<Button primary onClick={ this.sendRefund } disabled={ isPaymentLoading }>
				{ translate( 'Refund' ) }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ this.toggleDialog }
				className={ dialogClass }
				buttons={ dialogButtons }
				additionalClassNames="order-payment__dialog woocommerce"
			>
				<h1>{ translate( 'Refund order' ) }</h1>
				<OrderRefundTable order={ order } onChange={ this.recalculateRefund } />
				<form className="order-payment__container">
					<FormLabel className="order-payment__note">
						{ translate( 'Refund note' ) }
						<FormTextarea onChange={ this.updateNote } name="refund_note" value={ refundNote } />
					</FormLabel>

					<FormFieldset className="order-payment__details">
						<FormLabel className="order-payment__amount">
							<span className="order-payment__amount-label">
								{ translate( 'Total refund amount' ) }
							</span>
							<div className="order-payment__amount-value">
								<PriceInput
									name="refund_total"
									readOnly
									currency={ order.currency }
									value={ refundTotal }
								/>
							</div>
						</FormLabel>

						{ this.renderCreditCard() }
					</FormFieldset>

					{ errorMessage && (
						<Notice status="is-error" showDismiss={ false }>
							{ errorMessage }
						</Notice>
					) }
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
	dispatch => bindActionCreators( { fetchPaymentMethods, sendRefund }, dispatch )
)( localize( OrderPaymentCard ) );
