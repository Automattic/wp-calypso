/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import FormattedHeader from 'components/formatted-header';
import GuaranteeSeal from './guarantee-seal';
import Checkout from '../checkout';
import CartData from 'components/data/cart';
import CheckoutData from 'components/data/checkout';
import SecondaryCart from '../cart/secondary-cart';

class CheckoutContainer extends React.Component {
	constructor() {
		super();
		this.state = {
			headerText: '',
			shouldShowSeal: false,
		};
	}

	renderCheckoutHeader() {
		return this.state.headerText && <FormattedHeader headerText={ this.state.headerText } />;
	}

	setHeaderText = newHeaderText => {
		this.setState( { headerText: newHeaderText } );
	};

	renderGuaranteeSeal() {
		return this.state.shouldShowSeal && <GuaranteeSeal visible={ this.state.shouldShowSeal } />;
	}

	showGuaranteeSeal = visible => {
		this.setState( { shouldShowSeal: visible } );
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
							{ this.renderGuaranteeSeal() }
						</div>
					) }
				</div>
			</>
		);
	}
}

export default localize( CheckoutContainer );
