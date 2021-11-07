import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { hasRenewableSubscription } from 'calypso/lib/cart-values/cart-items';
import AdditionalTermsOfServiceInCart from './additional-terms-of-service-in-cart';
import BundledDomainNotice from './bundled-domain-notice';
import ConciergeRefundPolicy from './concierge-refund-policy';
import DomainRefundPolicy from './domain-refund-policy';
import DomainRegistrationAgreement from './domain-registration-agreement';
import DomainRegistrationHsts from './domain-registration-hsts';
import TermsOfService from './terms-of-service';
import TitanTermsOfService from './titan-terms-of-service';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class CheckoutTerms extends Component {
	render() {
		const { cart } = this.props;
		return (
			<Fragment>
				<div className="checkout__terms" id="checkout-terms">
					<strong>
						{ this.props.translate( 'By checking out:', {
							comment:
								'Headline before a list of terms the customer is agreeing to on checkout. Screenshot: https://user-images.githubusercontent.com/1379730/55166390-66c09080-5145-11e9-9c13-6c1b3b693786.png',
						} ) }
					</strong>
				</div>
				<TermsOfService hasRenewableSubscription={ hasRenewableSubscription( cart ) } />
				<DomainRegistrationAgreement cart={ cart } />
				<DomainRegistrationHsts cart={ cart } />
				<DomainRefundPolicy cart={ cart } />
				<ConciergeRefundPolicy cart={ cart } />
				<BundledDomainNotice cart={ cart } />
				<TitanTermsOfService cart={ cart } />
				<AdditionalTermsOfServiceInCart />
			</Fragment>
		);
	}
}

export default localize( CheckoutTerms );
