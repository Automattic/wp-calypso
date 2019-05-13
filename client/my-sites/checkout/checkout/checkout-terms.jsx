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
import DomainRegistrationHsts from './domain-registration-hsts';
import { localize } from 'i18n-calypso';

class CheckoutTerms extends React.Component {
	render() {
		const { cart } = this.props;
		return (
			<Fragment>
				<div className="checkout__terms">
					<strong>
						{ this.props.translate( 'By checking out:', {
							comment: 'Headline before a list of terms the customer is agreeing to on checkout.',
						} ) }
					</strong>
				</div>
				<TermsOfService hasRenewableSubscription={ cartItems.hasRenewableSubscription( cart ) } />
				<DomainRegistrationAgreement cart={ cart } />
				<DomainRegistrationHsts cart={ cart } />
				<DomainRegistrationRefundPolicy cart={ cart } />
			</Fragment>
		);
	}
}

export default localize( CheckoutTerms );
