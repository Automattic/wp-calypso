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
import SignupSiteCreatedNotice from 'my-sites/checkout/checkout/signup-site-created-notice';

/**
 * Style dependencies
 */
import './checkout-container.scss';

/**
 * Returns whether given site has been created in the last `n` minutes
 *
 * @param  {String}  createdAt               The site creation date stamp
 * @param  {Number}  creationWindowInMinutes A site is considered 'new' if it's been created in this time window (in minutes)
 * @return {Boolean}                         If the site is 'new'. Default `false`
 */
function isSelectedSiteNew( createdAt, creationWindowInMinutes = 5 ) {
	return moment( createdAt ).isAfter( moment().subtract( creationWindowInMinutes, 'minutes' ) );
}

class CheckoutContainer extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			headerText: '',
			shouldDisplaySiteCreatedNotice:
				props.isComingFromSignup && isSelectedSiteNew( get( props.selectedSite, 'options.created_at', '' ) ),
		};
	}

	componentDidMount() {
		if ( this.state.shouldDisplaySiteCreatedNotice ) {
			this.setHeaderText(
				this.props.translate( 'Your WordPress.com site is ready! Finish your purchase to get the most out of it.' )
			);
		}
	}

	renderCheckoutHeader() {
		return this.state.headerText && <FormattedHeader headerText={ this.state.headerText } />;
	}

	setHeaderText = headerText => this.setState( { headerText } );

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
				{ this.state.shouldDisplaySiteCreatedNotice && (
					<TransactionData>
						<SignupSiteCreatedNotice selectedSite={ this.props.selectedSite } />
					</TransactionData>
				) }
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
