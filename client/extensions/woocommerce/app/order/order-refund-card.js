/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { camelCase } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import formatCurrency from 'lib/format-currency';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import OrderDetailsTable from './order-details-table';
import PaymentLogo from 'components/payment-logo';

class OrderRefundCard extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			discount_total: PropTypes.string.isRequired,
			line_items: PropTypes.array.isRequired,
			payment_method_title: PropTypes.string.isRequired,
			shipping_total: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
	}

	state = {
		showRefundDialog: false,
	}

	getRefundedTotal = ( order ) => {
		return order.refunds.reduce( ( sum, i ) => sum + ( i.total * 1 ), 0 );
	}

	toggleRefundDialog = () => {
		this.setState( {
			showRefundDialog: ! this.state.showRefundDialog,
			refundTotal: 0,
			refundNote: '',
		} );
	}

	onChange = ( event ) => {
		switch ( event.target.name ) {
			case 'refund_total':
			case 'refund_note':
				this.setState( {
					[ camelCase( event.target.name ) ]: event.target.value,
				} );
				break;
			case 'shipping_total':
				this.setState( {
					refundTotal: this.state.refundTotal + parseFloat( event.target.value ),
				} );
				break;
			default:
				const total = parseFloat( event.target.dataset.price ) * event.target.value;
				this.setState( {
					refundTotal: this.state.refundTotal + parseFloat( total ),
				} );
		}
	}

	renderCreditCard = () => {
		const { translate } = this.props;
		const type = 'VISA';
		const digits = 'xxxx';
		const name = 'Tester';

		return (
			<div className="order__refund-credit-card">
				{ translate( 'Refunding payment with:' ) }
				<PaymentLogo className="order__card-logo" type={ type.toLowerCase() } />
				<div className="order__card-details">
					<p className="order__card-number">{ type } ****{ digits }</p>
					<p className="order__card-name">{ name }</p>
				</div>
			</div>
		);
	}

	render() {
		const { order, translate } = this.props;
		let refundStatus = translate( 'Payment of %(total)s received via %(method)s', {
			args: {
				total: formatCurrency( order.total, order.currency ) || order.total,
				method: order.payment_method_title,
			}
		} );

		if ( 'refunded' === order.status ) {
			refundStatus = translate( 'Payment of %(total)s has been refunded', {
				args: {
					total: formatCurrency( order.total, order.currency ) || order.total,
				}
			} );
		} else if ( order.refunds.length ) {
			const refund = this.getRefundedTotal( order );
			refundStatus = translate( 'Payment of %(total)s has been partially refunded %(refund)s', {
				args: {
					total: formatCurrency( order.total, order.currency ) || order.total,
					refund: formatCurrency( refund, order.currency ) || refund,
				}
			} );
		}

		const dialogClass = 'woocommerce'; // eslint/css specificity hack

		return (
			<div className="order__details-refund">
				<div className="order__details-refund-label">
					<Gridicon icon="checkmark" />
					{ refundStatus }
				</div>
				<div className="order__details-refund-action">
					{ ( 'refunded' !== order.status )
						? <Button onClick={ this.toggleRefundDialog }>{ translate( 'Submit Refund' ) }</Button>
						: null
					}
				</div>

				<Dialog isVisible={ this.state.showRefundDialog } onClose={ this.toggleRefundDialog } className={ dialogClass }>
					<h1>{ translate( 'Refund order' ) }</h1>
					<OrderDetailsTable order={ order } isEditable onChange={ this.onChange } />
					<form className="order__refund-container">
						<FormLabel className="order__refund-note">
							{ translate( 'Refund note' ) }
							<FormTextarea onChange={ this.onChange } name="refund_note" value={ this.state.refundNote } />
						</FormLabel>

						<FormFieldset>
							<FormLabel className="order__refund-amount">
								{ translate( 'Total refund amount' ) }
								<FormTextInput onChange={ this.onChange } name="refund_total" value={ this.state.refundTotal } />
							</FormLabel>

							{ this.renderCreditCard() }
						</FormFieldset>
					</form>
				</Dialog>
			</div>
		);
	}
}

export default localize( OrderRefundCard );
