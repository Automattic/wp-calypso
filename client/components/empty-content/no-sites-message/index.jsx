import { localize } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import getOnboardingUrl from 'calypso/signup/config/get-onboarding-url';

const NoSitesMessage = ( { translate } ) => {
	return (
		<EmptyContent
			className="no-sites-message"
			title={ translate( "You don't have any WordPress sites yet." ) }
			line={ translate( 'Would you like to start one?' ) }
			action={ translate( 'Create Site' ) }
			actionURL={ getOnboardingUrl() + '?ref=calypso-nosites' }
			illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
		/>
	);
};

export default localize( NoSitesMessage );
