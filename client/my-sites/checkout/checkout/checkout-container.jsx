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
import FormattedHeader from 'calypso/components/formatted-header';
import Checkout from '../checkout';
import CartData from 'calypso/components/data/cart';
import SignupSiteCreatedNotice from 'calypso/my-sites/checkout/checkout/signup-site-created-notice';
import Gridicon from 'calypso/components/gridicon';
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

	setHeaderText = ( headerText ) => this.setState( { headerText } );

	shouldDisplaySiteCreatedNotice() {
		return (
			( this.props.isComingFromSignup || this.props.isComingFromGutenboarding ) &&
			isSiteCreatedDateNew( get( this.props, 'selectedSite.options.created_at', '' ) )
		);
	}

	handleBack = () => {
		if ( this.props.isGutenboardingCreate ) {
			window.history.go( -1 );
		} else {
			window.location.href = `/home/${ this.props.selectedSite.slug }`;
		}
	};

	render() {
		const {
			product,
			purchaseId,
			feature,
			couponCode,
			plan,
			reduxStore,
			redirectTo,
			upgradeIntent,
			isComingFromGutenboarding,
			isGutenboardingCreate,
			isComingFromUpsell,
			infoMessage,
		} = this.props;

		return (
			<>
				{ this.props.isComingFromGutenboarding && (
					<Button
						borderless
						className="navigation-link back" // eslint-disable-line wpcalypso/jsx-classname-namespace
						onClick={ this.handleBack }
					>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ this.props.translate( 'Back' ) }
					</Button>
				) }
				{ this.renderCheckoutHeader() }
				{ this.shouldDisplaySiteCreatedNotice() && (
					<CartData>
						<SignupSiteCreatedNotice selectedSite={ this.props.selectedSite } />
					</CartData>
				) }
				<div className="checkout__container">
					<CartData>
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
							hideNudge={ isComingFromGutenboarding || isComingFromUpsell }
							returnToBlockEditor={ isGutenboardingCreate }
							returnToHome={ isComingFromGutenboarding }
							infoMessage={ infoMessage }
						>
							{ this.props.children }
						</Checkout>
					</CartData>
				</div>
			</>
		);
	}
}

export default localize( CheckoutContainer );
