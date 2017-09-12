/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import ActionButtons from 'woocommerce/woocommerce-services/components/action-buttons';
import formatDate from 'woocommerce/woocommerce-services/lib/utils/format-date';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeRefundDialog, confirmRefund } from '../../state/actions';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const RefundDialog = ( props ) => {
	const { siteId, orderId, refundDialog, storeOptions, created, refundable_amount, label_id } = props;

	const getRefundableAmount = () => {
		return storeOptions.currency_symbol + Number( refundable_amount ).toFixed( 2 );
	};

	const onClose = () => props.closeRefundDialog( siteId, orderId );
	const onConfirm = () => props.confirmRefund( siteId, orderId );
	return (
		<Dialog
			additionalClassNames="label-refund-modal woocommerce"
			isVisible={ Boolean( refundDialog && refundDialog.labelId === label_id ) }
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
				<dd>{ formatDate( created ) }</dd>

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
	refundable_amount: PropTypes.number,
	label_id: PropTypes.number,
	closeRefundDialog: PropTypes.func.isRequired,
	confirmRefund: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { siteId, orderId } ) => {
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
