/**
 * External dependencies
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import getOnboardingUrl from 'calypso/state/selectors/get-onboarding-url';

const NoSitesMessage = ( { translate } ) => {
	const onboardingUrl = useSelector( ( state ) => getOnboardingUrl( state ) );
	return (
		<EmptyContent
			title={ translate( "You don't have any WordPress sites yet." ) }
			line={ translate( 'Would you like to start one?' ) }
			action={ translate( 'Create Site' ) }
			actionURL={ onboardingUrl + '?ref=calypso-nosites' }
			illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
		/>
	);
};

export default localize( NoSitesMessage );
