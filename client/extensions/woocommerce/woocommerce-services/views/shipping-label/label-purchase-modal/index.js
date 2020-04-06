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
import AddressStep from './address-step';
import PackagesStep from './packages-step';
import CustomsStep from './customs-step';
import RatesStep from './rates-step';
import Sidebar from './sidebar';
import PurchaseButton from './purchase-button';
import FormSectionHeading from 'components/forms/form-section-heading';
import { exitPrintingFlow } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	isCustomsFormRequired,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const PurchaseDialog = props => {
	const { loaded, translate } = props;

	if ( ! loaded ) {
		return null;
	}

	const buttons = [
		<PurchaseButton key="purchase" siteId={ props.siteId } orderId={ props.orderId } />,
	];

	const onClose = () => props.exitPrintingFlow( props.orderId, props.siteId, false );

	if ( ! props.form.needsPrintConfirmation ) {
		buttons.unshift( {
			onClick: onClose,
			label: translate( 'Cancel' ),
			action: 'cancel',
		} );
	}

	return (
		<Dialog
			additionalClassNames="woocommerce label-purchase-modal wcc-root"
			isVisible={ props.showPurchaseDialog }
			onClose={ onClose }
			buttons={ buttons }
		>
			<div className="label-purchase-modal__content">
				<FormSectionHeading>
					{ 1 === props.form.packages.selected.length
						? translate( 'Create shipping label' )
						: translate( 'Create shipping labels' ) }
				</FormSectionHeading>
				<div className="label-purchase-modal__body">
					<div className="label-purchase-modal__main-section">
						<AddressStep
							type="origin"
							title={ translate( 'Origin address' ) }
							siteId={ props.siteId }
							orderId={ props.orderId }
						/>
						<AddressStep
							type="destination"
							title={ translate( 'Destination address' ) }
							siteId={ props.siteId }
							orderId={ props.orderId }
						/>
						<PackagesStep siteId={ props.siteId } orderId={ props.orderId } />
						{ props.isCustomsFormRequired && (
							<CustomsStep siteId={ props.siteId } orderId={ props.orderId } />
						) }
						<RatesStep siteId={ props.siteId } orderId={ props.orderId } />
					</div>
					<Sidebar siteId={ props.siteId } orderId={ props.orderId } />
				</div>
			</div>
		</Dialog>
	);
};

PurchaseDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		loaded,
		form: loaded && shippingLabel.form,
		showPurchaseDialog: shippingLabel && shippingLabel.showPurchaseDialog,
		isCustomsFormRequired: isCustomsFormRequired( state, orderId, siteId ),
	};
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators( { exitPrintingFlow }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( PurchaseDialog ) );
