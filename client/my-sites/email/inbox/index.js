import { localize, translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import PromoCard from 'calypso/components/promo-section/promo-card';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { getGSuiteMailboxCount } from 'calypso/lib/gsuite';
import { getConfiguredTitanMailboxCount } from 'calypso/lib/titan';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';
import MailboxSelectionList from 'calypso/my-sites/email/inbox/mailbox-selection-list';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

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
					className={ 'inbox__is-inbox-card' }
				>
					<p>{ translate( 'Pick one of your domains below to add an email solution.' ) }</p>
				</PromoCard>
				<br />
			</>
		);
	}

	// Find out if the site has at least one mailbox in the site
	const hasAnyMailboxes = domains.some(
		( domain ) =>
			( ! domain.isWPCOMDomain &&
				// it may be worth also checking for has(EmailProduct)WithUs( domain ) for each branch below
				getGSuiteMailboxCount( domain ) > 0 ) ||
			getConfiguredTitanMailboxCount( domain ) > 0
	);

	// Load the Inbox UI if at least one mailbox occurs
	if ( hasAnyMailboxes ) {
		return <MailboxSelectionList />;
	}

	const domainsWithEmailServices = domains.filter(
		( domain ) =>
			! domain.isWPCOMDomain && ( hasPaidEmailWithUs( domain ) || hasEmailForwards( domain ) )
	);

	const showActiveDomainList = domainsWithEmailServices.length > 0;

	if ( showActiveDomainList ) {
		return (
			<CalypsoShoppingCartProvider>
				<EmailManagementHome
					emailListInactiveHeader={ getMainHeader() }
					sectionHeaderLabel={ translate( 'Domains' ) }
					showActiveDomainList={ false }
				></EmailManagementHome>
			</CalypsoShoppingCartProvider>
		);
	}

	// Delegate to <EmailManagementHome/> in case we need to upsell a domain/mailbox
	return (
		<CalypsoShoppingCartProvider>
			<EmailManagementHome
				emailListInactiveHeader={ getMainHeader() }
				sectionHeaderLabel={ translate( 'Domains' ) }
			/>
		</CalypsoShoppingCartProvider>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		domains: getDomainsBySiteId( state, siteId ),
	};
} )( localize( InboxManagement ) );
