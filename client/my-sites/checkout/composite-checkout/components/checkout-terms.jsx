/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { hasRenewableSubscription } from 'calypso/lib/cart-values/cart-items';
import TermsOfService from './terms-of-service';
import DomainRefundPolicy from './domain-refund-policy';
import DomainRegistrationAgreement from './domain-registration-agreement';
import DomainRegistrationHsts from './domain-registration-hsts';
import ConciergeRefundPolicy from './concierge-refund-policy';
import BundledDomainNotice from './bundled-domain-notice';
import TitanTermsOfService from './titan-terms-of-service';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class CheckoutTerms extends React.Component {
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
			</Fragment>
		);
	}
}

export default localize( CheckoutTerms );
