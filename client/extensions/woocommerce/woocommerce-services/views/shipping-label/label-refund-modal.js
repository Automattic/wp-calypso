/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeRefundDialog, confirmRefund } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import formatCurrency from 'lib/format-currency';

class RefundDialog extends Component {
	onClose = () => this.props.closeRefundDialog( this.props.orderId, this.props.siteId );
	onConfirm = () => this.props.confirmRefund( this.props.orderId, this.props.siteId );

	render() {
		const { refundDialog, createdDate, refundableAmount, currency, labelId, translate, moment } = this.props;

		const getRefundableAmount = () => {
			return formatCurrency( refundableAmount, currency );
		};

		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ), onClick: this.onClose },
			{
				action: 'confirm',
				onClick: this.onConfirm,
				isPrimary: true,
				disabled: refundDialog && refundDialog.isSubmitting,
				additionalClassNames: refundDialog && refundDialog.isSubmitting ? 'is-busy' : '',
				label: translate( 'Refund label (-%(amount)s)', { args: { amount: getRefundableAmount() } } ),
			},
		];

		return (
			<Dialog
				additionalClassNames="label-refund-modal woocommerce wcc-root"
				isVisible={ Boolean( refundDialog && refundDialog.labelId === labelId ) }
				onClose={ this.onClose }
				buttons={ buttons }>
				<FormSectionHeading>
					{ translate( 'Request a refund' ) }
				</FormSectionHeading>
				<p>
					{ translate( 'You can request a refund for a shipping label that has not been used to ship a package. ' +
						'It will take at least 14 days to process.' ) }
				</p>
				<dl>
					<dt>{ translate( 'Purchase date' ) }</dt>
					<dd>{ moment( createdDate ).format( 'MMMM Do YYYY, h:mm a' ) }</dd>

					<dt>{ translate( 'Amount eligible for refund' ) }</dt>
					<dd>{ getRefundableAmount() }</dd>
				</dl>
			</Dialog>
		);
	}
}

RefundDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	refundDialog: PropTypes.object,
	createdDate: PropTypes.number,
	refundableAmount: PropTypes.number,
	currency: PropTypes.string,
	labelId: PropTypes.number,
	closeRefundDialog: PropTypes.func.isRequired,
	confirmRefund: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		refundDialog: loaded ? shippingLabel.refundDialog : {},
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeRefundDialog, confirmRefund }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( RefundDialog ) );
