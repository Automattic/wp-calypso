import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { getGSuiteMailboxCount } from 'calypso/lib/gsuite';
import { getConfiguredTitanMailboxCount } from 'calypso/lib/titan';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailManagementHome from 'calypso/my-sites/email/email-management/email-home';
import { INBOX_SOURCE } from 'calypso/my-sites/email/inbox/constants';
import MailboxSelectionList from 'calypso/my-sites/email/inbox/mailbox-selection-list';
import ProgressLine from 'calypso/my-sites/email/inbox/mailbox-selection-list/progress-line';
import { emailManagementInbox } from 'calypso/my-sites/email/paths';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const TrackPageView = ( { context } ) => {
	return (
		<PageViewTracker
			path={ emailManagementInbox( ':site' ) }
			title="Inbox"
			properties={ { context } }
		/>
	);
};

const NoAccessCard = () => {
	const translate = useTranslate();

	return (
		<Main>
			<TrackPageView context="no-access" />
			<EmptyContent
				title={ translate( 'You are not authorized to view this page' ) }
				illustration={ '/calypso/images/illustrations/illustration-404.svg' }
			/>
		</Main>
	);
};

const NotSupportedOnP2Card = () => {
	const translate = useTranslate();

	return (
		<Main>
			<TrackPageView context="not-supported-on-p2" />
			<EmptyContent
				title={ translate( 'Inbox is not supported on P2 sites' ) }
				illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
			/>
		</Main>
	);
};

const MainHeader = () => {
	const translate = useTranslate();
	const image = {
		path: emailIllustration,
		align: 'right',
	};

	return (
		<PromoCard
			className={ 'inbox__is-inbox-card' }
			icon={ null }
			image={ image }
			isPrimary={ true }
			title={ translate( 'Pick a domain to get started' ) }
		>
			<p>{ translate( 'Pick one of your domains below to add an email solution.' ) }</p>
		</PromoCard>
	);
};

const hasAtLeastOneMailbox = ( domains ) =>
	domains.some(
		( domain ) =>
			getGSuiteMailboxCount( domain ) > 0 || getConfiguredTitanMailboxCount( domain ) > 0
	);

const showActiveDomainList = ( domains ) =>
	domains.some( ( domain ) => hasPaidEmailWithUs( domain ) || hasEmailForwards( domain ) );

const InboxManagement = ( { selectedIntervalLength } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const canManageSite = useSelector( ( state ) =>
		canCurrentUser( state, selectedSiteId, 'manage_options' )
	);
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSiteId ) );
	const isLoadingDomains = useSelector(
		( state ) => ! hasLoadedSiteDomains( state, selectedSiteId )
	);
	const translate = useTranslate();

	const isP2 = useSelector( ( state ) => !! isSiteWPForTeams( state, selectedSiteId ) );

	if ( isP2 ) {
		return <NotSupportedOnP2Card />;
	}

	if ( ! canManageSite ) {
		return <NoAccessCard />;
	}

	if ( isLoadingDomains ) {
		return <ProgressLine statusText={ translate( 'Loading your mailboxes' ) } />;
	}

	const nonWPCOMDomains = domains.filter( ( domain ) => ! domain.isWPCOMDomain );

	if ( hasAtLeastOneMailbox( nonWPCOMDomains ) ) {
		return <MailboxSelectionList />;
	}

	return (
		<CalypsoShoppingCartProvider>
			<>
				<TrackPageView context="email-home" />
				<EmailManagementHome
					emailListInactiveHeader={ <MainHeader /> }
					sectionHeaderLabel={ translate( 'Domains' ) }
					selectedIntervalLength={ selectedIntervalLength }
					showActiveDomainList={ showActiveDomainList( nonWPCOMDomains ) }
					source={ INBOX_SOURCE }
				/>
			</>
		</CalypsoShoppingCartProvider>
	);
};

export default InboxManagement;
