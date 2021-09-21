import { localize, translate } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import PromoCard from 'calypso/components/promo-section/promo-card';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';
import { hasEmailSubscription } from 'calypso/my-sites/email/email-management/home/utils';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const InboxManagement = ( { domains } ) => {
	function getMainHeader() {
		const image = {
			path: emailIllustration,
			align: 'right',
		};

		return (
			<>
				<PromoCard
					isPrimary={ true }
					title={ translate( 'Pick a domain to get started' ) }
					image={ image }
				>
					<p>{ translate( 'Pick one of your domains below to add an email solution.' ) }</p>
				</PromoCard>
				<br />
			</>
		);
	}

	const domainsWithSubscriptions = domains.filter(
		( domain ) => ! domain.isWPCOMDomain && hasEmailSubscription( domain )
	);

	//EmailManagementHome logic will handle the case where there is only one domain to show directly the email comparison
	//and also if there is no domain so, it will show a CTA to buy domain
	if ( domainsWithSubscriptions.length === 0 ) {
		return (
			<CalypsoShoppingCartProvider>
				<EmailManagementHome
					emailListInactiveHeader={ getMainHeader() }
					sectionHeaderLabel={ translate( 'Domains' ) }
					onlyDomainsWithoutSubscription={ true }
				/>
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
