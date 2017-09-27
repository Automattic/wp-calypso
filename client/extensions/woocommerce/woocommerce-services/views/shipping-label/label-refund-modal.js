/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import ActionButtons from 'woocommerce/woocommerce-services/components/action-buttons';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeRefundDialog, confirmRefund } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const RefundDialog = ( props ) => {
	const { orderId, siteId, refundDialog, storeOptions, created, refundableAmount, labelId } = props;

	const getRefundableAmount = () => {
		return storeOptions.currency_symbol + Number( refundableAmount ).toFixed( 2 );
	};

	const onClose = () => props.closeRefundDialog( orderId, siteId );
	const onConfirm = () => props.confirmRefund( orderId, siteId );
	return (
		<Dialog
			additionalClassNames="label-refund-modal woocommerce"
			isVisible={ Boolean( refundDialog && refundDialog.labelId === labelId ) }
			onClose={ onClose }>
			<FormSectionHeading>
				{ __( 'Request a refund' ) }
			</FormSectionHeading>
			<p>
				{ __( 'You can request a refund for a shipping label that has not been used to ship a package. ' +
					'It will take at least 14 days to process.' ) }
			</p>
			<hr />
			<dl>
				<dt>{ __( 'Purchase date' ) }</dt>
				<dd>{ moment( created ).format( 'MMMM Do YYYY, h:mm a' ) }</dd>

				<dt>{ __( 'Amount eligible for refund' ) }</dt>
				<dd>{ getRefundableAmount() }</dd>
			</dl>
			<ActionButtons buttons={ [
				{
					onClick: onConfirm,
					isPrimary: true,
					isDisabled: refundDialog && refundDialog.isSubmitting,
					label: __( 'Refund label (-%(amount)s)', { args: { amount: getRefundableAmount() } } ),
				},
				{
					onClick: onClose,
					label: __( 'Cancel' ),
				},
			] } />
		</Dialog>
	);
};

RefundDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	refundDialog: PropTypes.object,
	storeOptions: PropTypes.object.isRequired,
	created: PropTypes.number,
	refundableAmount: PropTypes.number,
	labelId: PropTypes.number,
	closeRefundDialog: PropTypes.func.isRequired,
	confirmRefund: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		refundDialog: loaded ? shippingLabel.refundDialog : {},
		storeOptions: loaded ? shippingLabel.storeOptions : {},
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeRefundDialog, confirmRefund }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( RefundDialog );
