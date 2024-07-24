import page from '@automattic/calypso-router';
import React, { useState } from 'react';
import WPCloudSignupForm from 'calypso/a8c-for-hosts/components/wpcloud-signup-form';
import WPCloudSignupPricing from 'calypso/a8c-for-hosts/components/wpcloud-signup-pricing';

export default function WPCloudSignup() {
	const [ step, setStep ] = useState( 'form' );

	const loadPricingStep = () => setStep( 'pricing' );
	const loadPendingStep = () => page.redirect( '/wpcloud/' );

	if ( 'form' === step ) {
		return <WPCloudSignupForm onNext={ loadPricingStep } />;
	}

	if ( 'pricing' === step ) {
		return <WPCloudSignupPricing onNext={ loadPendingStep } />;
	}

	if ( 'pending' === step ) {
		return <div>status pending</div>;
	}

	return <div>loading</div>;
}
