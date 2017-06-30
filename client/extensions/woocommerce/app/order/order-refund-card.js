/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import formatCurrency from 'lib/format-currency';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import Notice from 'components/notice';
import OrderDetailsTable from './order-details-table';
import PriceInput from 'woocommerce/components/price-input';
import { sendRefund } from 'woocommerce/state/sites/orders/refunds/actions';
import StoredCard from 'my-sites/upgrades/checkout/stored-card';

class OrderRefundCard extends Component {
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

	getRefundedTotal = ( order ) => {
		return order.refunds.reduce( ( sum, i ) => sum + parseFloat( i.total ), 0 );
	}

	getRefundStatus = () => {
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
		return refundStatus;
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
		const { order, site, translate } = this.props;
		const maxRefund = parseFloat( order.total ) + this.getRefundedTotal( order );
		if ( this.state.refundTotal > maxRefund ) {
			this.setState( { errorMessage: translate( 'Refund must be less than order total.' ) } );
			return;
		} else if ( this.state.refundTotal <= 0 ) {
			this.setState( { errorMessage: translate( 'Refund must be greater than zero.' ) } );
			return;
		}
		this.toggleDialog();
		const refundObj = {
			amount: this.state.refundTotal + '', // API expects a string
			reason: this.state.refundNote,
			// api_refund
		};
		this.props.sendRefund( site.ID, order.id, refundObj );
	}

	renderCreditCard = () => {
		const { translate } = this.props;
		const card = {
			expiry: '',
			card_type: 'VISA',
			card: '4345',
			name: 'John Smith',
		};

		return (
			<div className="order__refund-credit-card">
				<h3>{ translate( 'Refunding payment with:' ) }</h3>
				<StoredCard card={ card } />
			</div>
		);
	}

	render() {
		const { order, site, translate } = this.props;
		const { errorMessage, refundNote, showDialog } = this.state;
		const dialogClass = 'woocommerce'; // eslint/css specificity hack
		let refundTotal = formatCurrency( 0, order.currency );
		if ( this.state.refundTotal ) {
			refundTotal = formatCurrency( this.state.refundTotal, order.currency ) || this.state.refundTotal;
		}
		refundTotal = refundTotal.replace( /[^0-9.,]/g, '' );

		return (
			<div className="order__details-refund">
				<div className="order__details-refund-label">
					<Gridicon icon="checkmark" />
					{ this.getRefundStatus() }
				</div>
				<div className="order__details-refund-action">
					{ ( 'refunded' !== order.status )
						? <Button onClick={ this.toggleDialog }>{ translate( 'Submit Refund' ) }</Button>
						: null
					}
				</div>

				<Dialog isVisible={ showDialog } onClose={ this.toggleDialog } className={ dialogClass }>
					<h1>{ translate( 'Refund order' ) }</h1>
					<OrderDetailsTable order={ order } isEditable onChange={ this.recalculateRefund } site={ site } />
					<form className="order__refund-container">
						<FormLabel className="order__refund-note">
							{ translate( 'Refund note' ) }
							<FormTextarea onChange={ this.updateNote } name="refund_note" value={ refundNote } />
						</FormLabel>

						<FormFieldset className="order__refund-details">
							<FormLabel className="order__refund-amount">
								<span className="order__refund-amount-label">{ translate( 'Total refund amount' ) }</span>
								<div className="order__refund-amount-value">
									<PriceInput
										name="refund_total"
										readOnly
										currency={ order.currency }
										value={ refundTotal } />
								</div>
							</FormLabel>

							{ this.renderCreditCard() }
						</FormFieldset>

						<div className="order__refund-actions">
							{ errorMessage && <Notice status="is-error" showDismiss={ false }>{ errorMessage }</Notice> }
							<Button onClick={ this.toggleDialog }>{ translate( 'Cancel' ) }</Button>
							<Button primary onClick={ this.sendRefund }>{ translate( 'Refund' ) }</Button>
						</div>
					</form>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	undefined,
	dispatch => bindActionCreators( { sendRefund }, dispatch )
)( localize( OrderRefundCard ) );
