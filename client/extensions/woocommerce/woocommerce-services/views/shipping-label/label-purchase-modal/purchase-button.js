/** @format */

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
import getPDFSupport from 'woocommerce/woocommerce-services/lib/utils/pdf-support';
import formatCurrency from 'lib/format-currency';
import {
	confirmPrintLabel,
	purchaseLabel,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getTotalPriceBreakdown,
	canPurchase,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

class PurchaseButton extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		orderId: PropTypes.number.isRequired,
	};

	getPurchaseButtonLabel = () => {
		const { form, ratesTotal, translate } = this.props;

		if ( form.needsPrintConfirmation ) {
			return translate( 'Print' );
		}

		if ( form.isSubmitting ) {
			return translate( 'Purchasing…' );
		}

		const noNativePDFSupport = 'addon' === getPDFSupport();

		if ( this.props.canPurchase ) {
			if ( noNativePDFSupport ) {
				return translate( 'Buy (%s)', { args: [ formatCurrency( ratesTotal, 'USD' ) ] } );
			}

			return translate( 'Buy & Print (%s)', { args: [ formatCurrency( ratesTotal, 'USD' ) ] } );
		}

		if ( noNativePDFSupport ) {
			return translate( 'Buy' );
		}

		return translate( 'Buy & Print' );
	};

	getPurchaseButtonAction = () => {
		const { form, orderId, siteId } = this.props;
		if ( form.needsPrintConfirmation ) {
			return () => this.props.confirmPrintLabel( orderId, siteId );
		}
		return () => this.props.purchaseLabel( orderId, siteId );
	};

	render() {
		const { form } = this.props;
		return (
			<Button
				disabled={
					! form.needsPrintConfirmation && ( ! this.props.canPurchase || form.isSubmitting )
				}
				onClick={ this.getPurchaseButtonAction() }
				primary
				busy={ form.isSubmitting && ! form.needsPrintConfirmation }
			>
				{ this.getPurchaseButtonLabel() }
			</Button>
		);
	}
}

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const priceBreakdown = getTotalPriceBreakdown( state, orderId, siteId );
	return {
		loaded,
		form: loaded && shippingLabel.form,
		canPurchase: loaded && canPurchase( state, orderId, siteId ),
		ratesTotal: priceBreakdown ? priceBreakdown.total : 0,
	};
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators( { confirmPrintLabel, purchaseLabel }, dispatch );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( PurchaseButton ) );
