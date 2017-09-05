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
import LoadingSpinner from 'components/spinner';
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
	const getPurchaseButtonLabel = () => {
		if ( props.form.needsPrintConfirmation ) {
			return __( 'Print' );
		}

		if ( props.form.isSubmitting ) {
			return (
				<div>
					<LoadingSpinner inline />
					<span className="label-purchase-modal__purchasing-label">{ __( 'Purchasing...' ) }</span>
				</div>
			);
		}

		const noNativePDFSupport = ( 'addon' === getPDFSupport() );

		if ( props.canPurchase ) {
			const currencySymbol = props.storeOptions.currency_symbol;
			const ratesTotal = getRatesTotal( props.form.rates );

			if ( noNativePDFSupport ) {
				return __( 'Buy (%(currencySymbol)s%(ratesTotal)s)', { args: { currencySymbol, ratesTotal } } );
			}

			return __( 'Buy & Print (%(currencySymbol)s%(ratesTotal)s)', { args: { currencySymbol, ratesTotal } } );
		}

		if ( noNativePDFSupport ) {
			return __( 'Buy' );
		}

		return __( 'Buy & Print' );
	};

	const getPurchaseButtonAction = () => {
		if ( props.form.needsPrintConfirmation ) {
			return () => props.confirmPrintLabel( props.form.printUrl );
		}
		return props.purchaseLabel;
	};

	const buttons = [
		{
			isDisabled: ! props.form.needsPrintConfirmation && ( ! props.canPurchase || props.form.isSubmitting ),
			onClick: getPurchaseButtonAction(),
			isPrimary: true,
			label: getPurchaseButtonLabel(),
		},
	];

	const onClose = () => props.exitPrintingFlow( false );

	if ( ! props.form.needsPrintConfirmation ) {
		buttons.push( {
			onClick: exitPrintingFlow,
			label: __( 'Cancel' ),
		} );
	}

	return (
		<Dialog
			additionalClassNames="woocommerce"
			isVisible={ props.showPurchaseDialog }
			onClose={ onClose } >
			<div className="label-purchase-modal__content">
				<FormSectionHeading>
					{ 1 === props.form.packages.selected.length ? __( 'Create shipping label' ) : __( 'Create shipping labels' ) }
				</FormSectionHeading>
				<div className="label-purchase-modal__body">
					<div className="label-purchase-modal__main-section">
						<AddressStep.Origin
							{ ...props }
							{ ...props.form.origin }
							errors={ props.errors.origin } />
						<AddressStep.Destination
							{ ...props }
							{ ...props.form.destination }
							errors={ props.errors.destination } />
						<PackagesStep
							{ ...props }
							{ ...props.form.packages }
							errors={ props.errors.packages } />
						<RatesStep
							{ ...props }
							{ ...props.form.rates }
							errors={ props.errors.rates } />
					</div>
					<Sidebar
						{ ...props }
						errors={ props.errors.rates } />
				</div>
				<ActionButtons buttons={ buttons } />
			</div>
		</Dialog>
	);
};

PurchaseDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
};

const mapStateToProps = ( state, { orderId } ) => {
	const loaded = isLoaded( state, orderId );
	const shippingLabel = getShippingLabel( state, orderId );
	const storeOptions = loaded ? shippingLabel.storeOptions : {};
	return {
		form: loaded && shippingLabel.form,
		showPurchaseDialog: shippingLabel.showPurchaseDialog,
		currency_symbol: storeOptions.currency_symbol,
		errors: loaded && getFormErrors( state, storeOptions ),
		canPurchase: loaded && canPurchase( state, storeOptions ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { confirmPrintLabel, purchaseLabel, exitPrintingFlow }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( PurchaseDialog );
