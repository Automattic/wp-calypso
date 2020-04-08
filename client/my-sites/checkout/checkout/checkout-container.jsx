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
import Gridicon from 'components/gridicon';
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './checkout-container.scss';

/**
 * Returns whether a given site creation date is "new", that is whether the date falls in the last `n` minutes
 *
 * @param  {string}  createdAt               The site creation date stamp
 * @param  {number}  creationWindowInMinutes A site creation date is considered 'new' if it's been created in this time window (in minutes)
 * @returns {boolean}                        If the creation date is 'new'. Default `false`
 */
function isSiteCreatedDateNew( createdAt, creationWindowInMinutes = 5 ) {
	return moment( createdAt ).isAfter( moment().subtract( creationWindowInMinutes, 'minutes' ) );
}

class CheckoutContainer extends React.Component {
	state = {
		headerText: '',
	};

	componentDidMount() {
		if ( this.shouldDisplaySiteCreatedNotice() ) {
			this.setHeaderText(
				this.props.translate(
					'Your WordPress.com site is ready! Finish your purchase to get the most out of it.'
				)
			);
		}
	}

	renderCheckoutHeader() {
		return this.state.headerText && <FormattedHeader headerText={ this.state.headerText } />;
	}

	setHeaderText = headerText => this.setState( { headerText } );

	shouldDisplaySiteCreatedNotice() {
		return (
			( this.props.isComingFromSignup || this.props.isComingFromGutenboarding ) &&
			isSiteCreatedDateNew( get( this.props, 'selectedSite.options.created_at', '' ) )
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
			upgradeIntent,
			shouldShowCart = true,
			clearTransaction,
			isComingFromGutenboarding,
		} = this.props;

		const TransactionData = clearTransaction ? CartData : CheckoutData;

		return (
			<>
				{ this.props.isComingFromGutenboarding && (
					<Button
						borderless
						className="navigation-link back" // eslint-disable-line wpcalypso/jsx-classname-namespace
						onClick={ () => window.history.go( this.props.isGutenboardingCreate ? -1 : -2 ) } // going back to signup flow and skipping '/launch' step
					>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ this.props.translate( 'Back' ) }
					</Button>
				) }
				{ this.renderCheckoutHeader() }
				{ this.shouldDisplaySiteCreatedNotice() && (
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
							upgradeIntent={ upgradeIntent }
							hideNudge={ isComingFromGutenboarding }
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
