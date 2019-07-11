/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import FormattedHeader from 'components/formatted-header';
import Checkout from '../checkout';
import CartData from 'components/data/cart';
import CheckoutData from 'components/data/checkout';
import SecondaryCart from '../cart/secondary-cart';

class CheckoutContainer extends React.Component {
	constructor() {
		super();
		this.state = {
			headerText: '',
		};
	}

	renderCheckoutHeader() {
		return this.state.headerText && <FormattedHeader headerText={ this.state.headerText } />;
	}

	setHeaderText = newHeaderText => {
		this.setState( { headerText: newHeaderText } );
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
							reduxStore={ reduxStore }
							redirectTo={ redirectTo }
						>
							{ this.props.children }
						</Checkout>
					</TransactionData>

					{ shouldShowCart && (
						<CartData>
							<SecondaryCart selectedSite={ selectedSite } />
						</CartData>
					) }
				</div>
			</>
		);
	}
}

export default localize( CheckoutContainer );
