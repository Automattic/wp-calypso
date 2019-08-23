/**
 * External dependencies
 */
import React from 'react';
import moment from 'moment';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import FormattedHeader from 'components/formatted-header';
import Checkout from '../checkout';
import CartData from 'components/data/cart';
import CheckoutData from 'components/data/checkout';
import SecondaryCart from '../cart/secondary-cart';

/**
 * Style dependencies
 */
import './checkout-container.scss';

class CheckoutContainer extends React.Component {
	state = {
		headerText: '',
	};

	componentDidMount() {
		this.setSiteCreatedNotice();
	}

	renderCheckoutHeader() {
		return this.state.headerText && <FormattedHeader headerText={ this.state.headerText } />;
	}

	setHeaderText = newHeaderText => {
		this.setState( { headerText: newHeaderText } );
	};

	setSiteCreatedNotice() {
		// TODO:
		// Add this as a child of TransactionData so we can grab the cart details
		// Once we have the cart details we can tweak the copy depending on what's the in the cart,
		// e.g., once you've purchased xyz.com, your new site address will be xyz.com
		// or
		// once you've upgraded to the X plan you'll be able to add a domain
		// Do we need to set data in the signup state to validate that this site has been created via the onboarding flow?
		// Probably, as the root cause is users  clicking back in the onboarding flow, not knowing that a site has already been created.
		const createdAt = get( this.props.selectedSite, 'options.created_at', '' );
		const isSelectedSiteNew = moment( createdAt ).isAfter( moment().subtract( 10, 'minutes' ) );
		if ( ! isSelectedSiteNew ) {
			return;
		}

		this.setHeaderText(
			`Your site, ${ this.props.selectedSite.slug }, is created and ready to upgrade!`,
			'Continue with your purchase to access your upgrade benefits.'
		);
	}

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
