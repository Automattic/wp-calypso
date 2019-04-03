/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import TermsOfService from './terms-of-service';
import DomainRegistrationRefundPolicy from './domain-registration-refund-policy';
import DomainRegistrationAgreement from './domain-registration-agreement';
import { localize } from 'i18n-calypso';

class CheckoutTerms extends React.Component {
	render() {
		const { cart } = this.props;
		return (
			<Fragment>
				<div className="checkout__terms">
					<strong>By checking out:</strong>
				</div>
				<TermsOfService hasRenewableSubscription={ cartItems.hasRenewableSubscription( cart ) } />
				<DomainRegistrationAgreement cart={ cart } />
				<DomainRegistrationRefundPolicy cart={ cart } />
			</Fragment>
		);
	}
}

export default localize( CheckoutTerms );
