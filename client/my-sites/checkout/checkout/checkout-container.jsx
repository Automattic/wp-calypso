/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import FormattedHeader from 'components/formatted-header';
import CheckoutSeals from './checkout-seals';
import Checkout from '../checkout';
import CartData from 'components/data/cart';
import CheckoutData from 'components/data/checkout';
import SecondaryCart from '../cart/secondary-cart';
import { abtest } from 'lib/abtest';

class CheckoutContainer extends React.Component {
	constructor() {
		super();
		this.state = {
			headerText: '',
			subHeaderText: '',
			shouldShowGuaranteeSeal: false,
		};
	}

	renderCheckoutHeader() {
		return (
			this.state.headerText && (
				<FormattedHeader
					headerText={ this.state.headerText }
					subHeaderText={ this.state.subHeaderText }
				/>
			)
		);
	}

	setHeaderText = ( newHeaderText, newSubHeaderText ) => {
		this.setState( { headerText: newHeaderText, subHeaderText: newSubHeaderText } );
	};

	renderCheckoutSeals() {
		return <CheckoutSeals guaranteeVisible={ this.state.shouldShowGuaranteeSeal } />;
	}

	showGuaranteeSeal = visible => {
		this.setState( { shouldShowGuaranteeSeal: visible } );
	};

	render() {
		const {
			product,
			purchaseId,
			feature,
			couponCode,
			plan,
			selectedSite,
			reduxStore,
			redirectTo,
			shouldShowCart = true,
			clearTransaction,
		} = this.props;

		const TransactionData = clearTransaction ? CartData : CheckoutData;
		return (
			<>
				{ this.renderCheckoutHeader() }
				<div className="checkout__container">
					<TransactionData>
						<Checkout
							product={ product }
							purchaseId={ purchaseId }
							selectedFeature={ feature }
							couponCode={ couponCode }
							plan={ plan }
							setHeaderText={ this.setHeaderText }
							showGuaranteeSeal={ this.showGuaranteeSeal }
							reduxStore={ reduxStore }
							redirectTo={ redirectTo }
						>
							{ this.props.children }
						</Checkout>
					</TransactionData>

					{ shouldShowCart && (
						<div className="secondary-cart__container">
							<CartData>
								<SecondaryCart selectedSite={ selectedSite } />
							</CartData>
							{ 'variant' === abtest( 'checkoutSealsCopyBundle' ) && this.renderCheckoutSeals() }
						</div>
					) }
				</div>
			</>
		);
	}
}

export default localize( CheckoutContainer );
