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
		return <FormattedHeader headerText={ this.state.headerText } />;
	}

	setHeaderText = newHeaderText => {
		this.setState( { headerText: newHeaderText } );
	};

	render() {
		const { product, purchaseId, feature, couponCode, plan, selectedSite, reduxStore } = this.props;

		return (
			<>
				{ this.renderCheckoutHeader() }
				<div className="checkout__container">
					<CheckoutData>
						<Checkout
							product={ product }
							purchaseId={ purchaseId }
							selectedFeature={ feature }
							couponCode={ couponCode }
							plan={ plan }
							setHeaderText={ this.setHeaderText }
							reduxStore={ reduxStore }
						/>
						<CartData>
							<SecondaryCart selectedSite={ selectedSite } />
						</CartData>
					</CheckoutData>
				</div>
			</>
		);
	}
}

export default localize( CheckoutContainer );
