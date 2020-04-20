/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormSectionHeading from 'components/forms/form-section-heading';
import { getOrigin } from 'woocommerce/lib/nav-utils';
import { userCanManagePayments } from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import { closeDetailsDialog } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	isLoaded,
	getShippingLabel,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const DetailsDialog = ( props ) => {
	const {
		orderId,
		siteId,
		isVisible,
		labelIndex,
		serviceName,
		packageName,
		productNames,
		canManagePayments,
		receiptId,
		translate,
	} = props;

	const onClose = () => props.closeDetailsDialog( orderId, siteId );
	const buttons = [ { action: 'close', label: translate( 'Close' ), onClick: onClose } ];

	const renderReceiptLink = () => {
		if ( ! canManagePayments || ! receiptId ) {
			return null;
		}

		return (
			<a
				href={ `${ getOrigin() }/me/purchases/billing/${ receiptId }` }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Receipt' ) }
			</a>
		);
	};

	return (
		<Dialog
			additionalClassNames="label-details-modal woocommerce wcc-root"
			isVisible={ isVisible }
			onClose={ onClose }
			buttons={ buttons }
		>
			<FormSectionHeading className="shipping-label__label-details-modal-heading">
				<span className="shipping-label__label-details-modal-heading-title">
					{ translate( 'Label #%(labelIndex)s details', { args: { labelIndex: labelIndex + 1 } } ) }
				</span>
				{ renderReceiptLink() }
			</FormSectionHeading>
			<dl>
				<dt>{ translate( 'Service' ) }</dt>
				<dd>{ serviceName }</dd>

				<dt>{ translate( 'Package' ) }</dt>
				<dd>{ packageName }</dd>

				<dt>{ translate( 'Items' ) }</dt>
				<dd>
					<ul>
						{ productNames.map( ( productName, i ) => (
							<li key={ i }>{ productName }</li>
						) ) }
					</ul>
				</dd>
			</dl>
		</Dialog>
	);
};

DetailsDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	isVisible: PropTypes.bool,
	serviceName: PropTypes.string,
	packageName: PropTypes.string,
	productNames: PropTypes.array,
	closeDetailsDialog: PropTypes.func.isRequired,
	receiptId: PropTypes.number,
};

const mapStateToProps = ( state, { orderId, siteId, labelId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const { detailsDialog } = getShippingLabel( state, orderId, siteId );
	return {
		isVisible: Boolean( loaded && detailsDialog && detailsDialog.labelId === labelId ),
		canManagePayments: userCanManagePayments( state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeDetailsDialog }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( DetailsDialog ) );
