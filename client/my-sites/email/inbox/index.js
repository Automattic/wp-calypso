import { localize, translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import PromoCard from 'calypso/components/promo-section/promo-card';
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
	const hasOneOrMoreMailboxes = domains
		.filter( ( domain ) => ! domain.isWPCOMDomain )
		.reduce( ( accumulator, domain ) => {
			const mailboxCountForDomain =
				getGSuiteMailboxCount( domain ) + getConfiguredTitanMailboxCount( domain );
			accumulator = mailboxCountForDomain > 0;

			return accumulator;
		}, 0 );

	// Load the Inbox UI if at least one mailbox occurs
	if ( hasOneOrMoreMailboxes ) {
		return <MailboxSelectionList />;
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
