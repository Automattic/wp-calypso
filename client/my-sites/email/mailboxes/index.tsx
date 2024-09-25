import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import noSitesIllustration from 'calypso/assets/images/illustrations/illustration-nosites.svg';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { getGSuiteMailboxCount } from 'calypso/lib/gsuite';
import { getConfiguredTitanMailboxCount } from 'calypso/lib/titan';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailHome from 'calypso/my-sites/email/email-management/email-home';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { MAILBOXES_SOURCE } from 'calypso/my-sites/email/mailboxes/constants';
import MailboxSelectionList from 'calypso/my-sites/email/mailboxes/mailbox-selection-list';
import ProgressLine from 'calypso/my-sites/email/mailboxes/mailbox-selection-list/progress-line';
import { getMailboxesPath } from 'calypso/my-sites/email/paths';
import { useSelector, useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const TrackPageView = ( { context }: { context: string } ) => {
	return (
		<PageViewTracker
			path={ getMailboxesPath( ':site' ) }
			title="My Mailboxes"
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
				illustration="/calypso/images/illustrations/illustration-404.svg"
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
				title={ translate( 'Mailboxes are not supported on P2 sites' ) }
				illustration={ noSitesIllustration }
			/>
		</Main>
	);
};

const MainHeader = () => {
	const translate = useTranslate();

	return (
		<PromoCard
			className="mailboxes-card"
			icon={ undefined }
			image={ {
				path: emailIllustration,
				align: 'right',
			} }
			isPrimary
			title={ translate( 'Pick a domain to get started' ) }
		>
			<p>{ translate( 'Pick one of your domains below to add an email solution.' ) }</p>
		</PromoCard>
	);
};

const hasAtLeastOneMailbox = ( domains: ResponseDomain[] ) =>
	domains.some(
		( domain ) =>
			getGSuiteMailboxCount( domain ) > 0 || getConfiguredTitanMailboxCount( domain ) > 0
	);

const showActiveDomainList = ( domains: ResponseDomain[] ) =>
	domains.some( ( domain ) => hasPaidEmailWithUs( domain ) || hasEmailForwards( domain ) );

const MailboxesManagement = ( {
	selectedIntervalLength,
}: {
	selectedIntervalLength: IntervalLength;
} ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const canManageSite = useSelector( ( state ) =>
		canCurrentUser( state, selectedSiteId ?? undefined, 'manage_options' )
	);
	const domains = useSelector( ( state ) =>
		getDomainsBySiteId( state, selectedSiteId ?? undefined )
	);
	const isLoadingDomains = useSelector(
		( state ) => ! hasLoadedSiteDomains( state, selectedSiteId )
	);
	const translate = useTranslate();
	const dispatch = useDispatch();

	// Email checkout provides the /mailbox route with a new email param, e.g. /mailboxes/example.com?new-email=example@example.com
	const queryParams = new URLSearchParams( window.location.search );
	const newEmail = queryParams.get( 'new-email' );

	useEffect( () => {
		if ( ! newEmail ) {
			return;
		}
		dispatch(
			successNotice( translate( 'Your new mailbox has been created.' ), {
				duration: 5000,
			} )
		);
	}, [ newEmail, dispatch, translate ] );

	const isP2 = useSelector( ( state ) => !! isSiteWPForTeams( state, selectedSiteId as number ) );

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
		return <MailboxSelectionList domains={ nonWPCOMDomains } />;
	}

	if ( selectedSiteId && newEmail ) {
		return (
			<>
				<QuerySiteDomains siteId={ selectedSiteId } />
				<ProgressLine statusText={ translate( 'Loading your mailboxes' ) } />
			</>
		);
	}

	return (
		<CalypsoShoppingCartProvider>
			<>
				<TrackPageView context="email-home" />
				<EmailHome
					emailListInactiveHeader={ <MainHeader /> }
					sectionHeaderLabel={ translate( 'Domains' ) }
					selectedIntervalLength={ selectedIntervalLength }
					showActiveDomainList={ showActiveDomainList( nonWPCOMDomains ) }
					source={ MAILBOXES_SOURCE }
				/>
			</>
		</CalypsoShoppingCartProvider>
	);
};

export default MailboxesManagement;
