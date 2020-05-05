/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormSectionHeading from 'components/forms/form-section-heading';
import { withLocalizedMoment } from 'components/localized-moment';
import {
	closeRefundDialog,
	confirmRefund,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	isLoaded,
	getShippingLabel,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const RefundDialog = ( props ) => {
	const {
		orderId,
		siteId,
		refundDialog,
		createdDate,
		refundableAmount,
		currency,
		labelId,
		translate,
		moment,
	} = props;

	const getRefundableAmount = () => {
		return formatCurrency( refundableAmount, currency );
	};

	const onClose = () => props.closeRefundDialog( orderId, siteId );
	const onConfirm = () => props.confirmRefund( orderId, siteId );

	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ), onClick: onClose },
		{
			action: 'confirm',
			onClick: onConfirm,
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
			onClose={ onClose }
			buttons={ buttons }
		>
			<FormSectionHeading>{ translate( 'Request a refund' ) }</FormSectionHeading>
			<p>
				{ translate(
					'You can request a refund for a shipping label that has not been used to ship a package. ' +
						'It will take at least 14 days to process.'
				) }
			</p>
			<dl>
				<dt>{ translate( 'Purchase date' ) }</dt>
				<dd>{ moment( createdDate ).format( 'MMMM Do YYYY, h:mm a' ) }</dd>

				<dt>{ translate( 'Amount eligible for refund' ) }</dt>
				<dd>{ getRefundableAmount() }</dd>
			</dl>
		</Dialog>
	);
};

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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withLocalizedMoment( RefundDialog ) ) );
