import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';
import { hasEmailSubscription } from 'calypso/my-sites/email/email-management/home/utils';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const InboxManagement = ( { domains } ) => {
	const nonWPCOMDomains = domains.filter( ( domain ) => ! domain.isWPCOMDomain );
	const domainsWithSubscriptions = nonWPCOMDomains.filter( ( domain ) =>
		hasEmailSubscription( domain )
	);

	//EmailManagementHome logic will handle the case where there is only one domain to show directly the email comparison
	//and also if there is no domain so, it will show a CTA to buy domain
	if ( domainsWithSubscriptions.length === 0 ) {
		return (
			<CalypsoShoppingCartProvider>
				<EmailManagementHome />
			</CalypsoShoppingCartProvider>
		);
	}

	//If we are at this point it means that we've at least have one subscription to show in mailbox selector
	return <h1>Placeholder</h1>;
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		domains: getDomainsBySiteId( state, siteId ),
	};
} )( localize( InboxManagement ) );
