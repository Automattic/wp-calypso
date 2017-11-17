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
import Button from 'components/button';
import Dialog from 'components/dialog';
import getPDFSupport from 'woocommerce/woocommerce-services/lib/utils/pdf-support';
import AddressStep from './address-step';
import PackagesStep from './packages-step';
import RatesStep from './rates-step';
import Sidebar from './sidebar';
import FormSectionHeading from 'components/forms/form-section-heading';
import { confirmPrintLabel, purchaseLabel, exitPrintingFlow } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getRatesTotal,
	getFormErrors,
	canPurchase,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const PurchaseDialog = ( props ) => {
	const { loaded, translate } = props;

	if ( ! loaded ) {
		return null;
	}

	const getPurchaseButtonLabel = () => {
		if ( props.form.needsPrintConfirmation ) {
			return translate( 'Print' );
		}

		if ( props.form.isSubmitting ) {
			return translate( 'Purchasing…' );
		}

		const noNativePDFSupport = ( 'addon' === getPDFSupport() );

		if ( props.canPurchase ) {
			const currencySymbol = props.storeOptions.currency_symbol;
			const ratesTotal = props.ratesTotal;

			if ( noNativePDFSupport ) {
				return translate( 'Buy (%(currencySymbol)s%(ratesTotal)s)', { args: { currencySymbol, ratesTotal } } );
			}

			return translate( 'Buy & Print (%(currencySymbol)s%(ratesTotal)s)', { args: { currencySymbol, ratesTotal } } );
		}

		if ( noNativePDFSupport ) {
			return translate( 'Buy' );
		}

		return translate( 'Buy & Print' );
	};

	const getPurchaseButtonAction = () => {
		if ( props.form.needsPrintConfirmation ) {
			return () => props.confirmPrintLabel( props.orderId, props.siteId );
		}
		return () => props.purchaseLabel( props.orderId, props.siteId );
	};

	const buttons = [
		( <Button
			key="purchase"
			disabled={ ! props.form.needsPrintConfirmation && ( ! props.canPurchase || props.form.isSubmitting ) }
			onClick={ getPurchaseButtonAction() }
			primary
			busy={ props.form.isSubmitting }>
			{ getPurchaseButtonLabel() }
		</Button> )
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
			buttons={ buttons } >
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
							orderId={ props.orderId } />
						<AddressStep
							type="destination"
							title={ translate( 'Destination address' ) }
							siteId={ props.siteId }
							orderId={ props.orderId } />
						<PackagesStep
							siteId={ props.siteId }
							orderId={ props.orderId } />
						<RatesStep
							siteId={ props.siteId }
							orderId={ props.orderId } />
					</div>
					<Sidebar
						siteId={ props.siteId }
						orderId={ props.orderId } />
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
	const storeOptions = loaded ? shippingLabel.storeOptions : {};
	return {
		loaded,
		form: loaded && shippingLabel.form,
		storeOptions,
		showPurchaseDialog: shippingLabel.showPurchaseDialog,
		currency_symbol: storeOptions.currency_symbol,
		errors: loaded && getFormErrors( state, orderId, siteId ),
		canPurchase: loaded && canPurchase( state, orderId, siteId ),
		ratesTotal: getRatesTotal( state, orderId, siteId )
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { confirmPrintLabel, purchaseLabel, exitPrintingFlow }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( PurchaseDialog ) );
