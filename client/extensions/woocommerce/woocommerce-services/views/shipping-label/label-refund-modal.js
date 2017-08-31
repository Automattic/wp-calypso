/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Modal from 'components/modal';
import ActionButtons from 'components/action-buttons';
import formatDate from 'lib/utils/format-date';
import FormSectionHeading from 'components/forms/form-section-heading';

const RefundDialog = ( { refundDialog, labelActions, storeOptions, created, refundable_amount, label_id } ) => {
	const getRefundableAmount = () => {
		return storeOptions.currency_symbol + Number( refundable_amount ).toFixed( 2 );
	};

	return (
		<Modal
			isVisible={ Boolean( refundDialog && refundDialog.labelId === label_id ) }
			onClose={ labelActions.closeRefundDialog }
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
					onClick: labelActions.confirmRefund,
					isPrimary: true,
					isDisabled: refundDialog && refundDialog.isSubmitting,
					label: __( 'Refund label (-%(amount)s)', { args: { amount: getRefundableAmount() } } ),
				},
				{
					onClick: labelActions.closeRefundDialog,
					label: __( 'Cancel' ),
				},
			] } />
		</Modal>
	);
};

RefundDialog.propTypes = {
	refundDialog: PropTypes.object,
	labelActions: PropTypes.object.isRequired,
	storeOptions: PropTypes.object.isRequired,
	created: PropTypes.number,
	refundable_amount: PropTypes.number,
	label_id: PropTypes.number,
};

export default RefundDialog;
