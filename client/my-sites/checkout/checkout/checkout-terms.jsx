/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import { hasRenewableSubscription } from 'lib/cart-values/cart-items';
import TermsOfService from './terms-of-service';
import DomainRegistrationRefundPolicy from './domain-registration-refund-policy';
import DomainRegistrationAgreement from './domain-registration-agreement';
import DomainRegistrationHsts from './domain-registration-hsts';
import ConciergeRefundPolicy from './concierge-refund-policy';
import { localize } from 'i18n-calypso';

class CheckoutTerms extends React.Component {
	render() {
		const { cart } = this.props;
		return (
			<Fragment>
				<div className="checkout__terms">
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
				<DomainRegistrationRefundPolicy cart={ cart } />
				<ConciergeRefundPolicy cart={ cart } />
			</Fragment>
		);
	}
}

export default localize( CheckoutTerms );
