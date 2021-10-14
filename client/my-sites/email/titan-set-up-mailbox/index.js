import { useTranslate } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasTitanMailWithUs, getTitanProductName } from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	emailManagementPurchaseNewEmailAccount,
	emailManagementTitanSetUpMailbox,
} from 'calypso/my-sites/email/paths';
import TitanSetUpMailboxForm from 'calypso/my-sites/email/titan-set-up-mailbox/titan-set-up-mailbox-form';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const TitanSetUpMailbox = ( { selectedDomainName, source } ) => {
	const selectedSite = useSelector( getSelectedSite );

	const currentRoute = useSelector( getCurrentRoute );

	const previousRoute = useSelector( getPreviousRoute );

	const siteId = selectedSite?.ID ?? null;

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );

	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );

	const hasTitanSubscription = hasTitanMailWithUs( selectedDomain );

	const areSiteDomainsLoaded = useSelector( ( state ) => hasLoadedSiteDomains( state, siteId ) );

	const analyticsPath = emailManagementTitanSetUpMailbox( ':site', ':domain', currentRoute );

	const siteSlug = selectedSite?.slug ?? null;

	const handleBack = useCallback( () => {
		page( previousRoute );
	}, [ previousRoute ] );

	const translate = useTranslate();

	if ( areSiteDomainsLoaded && ! hasTitanSubscription ) {
		page(
			emailManagementPurchaseNewEmailAccount( siteSlug, selectedDomainName, currentRoute, source )
		);

		return null;
	}

	const title = translate( 'Set up mailbox' );

	return (
		<>
			<PageViewTracker path={ analyticsPath } title="Email Management > Set Up Titan Mailbox" />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout={ true }>
				<DocumentHead title={ titleCase( title ) } />

				<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

				<HeaderCake onClick={ handleBack }>
					{ getTitanProductName() + ': ' + selectedDomainName }
				</HeaderCake>

				<SectionHeader label={ title } className="titan-set-up-mailbox__section-header" />

				<TitanSetUpMailboxForm
					areSiteDomainsLoaded={ areSiteDomainsLoaded }
					selectedDomainName={ selectedDomainName }
				/>
			</Main>
		</>
	);
};

TitanSetUpMailbox.propType = {
	selectedDomainName: PropTypes.string.isRequired,
	source: PropTypes.string,
};

export default TitanSetUpMailbox;
