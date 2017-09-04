/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Modal from 'components/modal';
import ActionButtons from 'components/action-buttons';
import formatDate from 'lib/utils/format-date';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeRefundDialog, confirmRefund } from '../../state/actions';

const RefundDialog = ( props ) => {
	const { refundDialog, storeOptions, created, refundable_amount, label_id } = props;

	const getRefundableAmount = () => {
		return storeOptions.currency_symbol + Number( refundable_amount ).toFixed( 2 );
	};

	return (
		<Modal
			isVisible={ Boolean( refundDialog && refundDialog.labelId === label_id ) }
			onClose={ props.closeRefundDialog }
			additionalClassNames="label-refund-modal">
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
					onClick: props.confirmRefund,
					isPrimary: true,
					isDisabled: refundDialog && refundDialog.isSubmitting,
					label: __( 'Refund label (-%(amount)s)', { args: { amount: getRefundableAmount() } } ),
				},
				{
					onClick: props.closeRefundDialog,
					label: __( 'Cancel' ),
				},
			] } />
		</Modal>
	);
};

RefundDialog.propTypes = {
	refundDialog: PropTypes.object,
	storeOptions: PropTypes.object.isRequired,
	created: PropTypes.number,
	refundable_amount: PropTypes.number,
	label_id: PropTypes.number,
	closeRefundDialog: PropTypes.func.isRequired,
	confirmRefund: PropTypes.func.isRequired,
};

const mapStateToProps = ( state ) => {
	const shippingLabel = state.shippingLabel;
	const loaded = shippingLabel.loaded;
	return {
		refundDialog: loaded ? shippingLabel.refundDialog : {},
		storeOptions: loaded ? shippingLabel.storeOptions : {},
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeRefundDialog, confirmRefund }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( RefundDialog );
