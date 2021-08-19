import { useTranslate } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
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
	emailManagementTitanSetupMailbox,
} from 'calypso/my-sites/email/paths';
import TitanSetupMailboxForm from 'calypso/my-sites/email/titan-setup-mailbox/titan-setup-mailbox-form';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const TitanSetupMailbox = ( { selectedDomainName } ) => {
	const selectedSite = useSelector( getSelectedSite );

	const currentRoute = useSelector( getCurrentRoute );

	const previousRoute = useSelector( getPreviousRoute );

	const siteId = selectedSite?.ID ?? null;

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );

	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );

	const hasTitanSubscription = hasTitanMailWithUs( selectedDomain );

	const areSiteDomainsLoaded = useSelector( ( state ) => hasLoadedSiteDomains( state, siteId ) );

	const analyticsPath = emailManagementTitanSetupMailbox( ':site', ':domain', currentRoute );

	const siteSlug = selectedSite?.slug ?? null;

	const handleBack = useCallback( () => {
		page( previousRoute );
	}, [ previousRoute ] );

	const translate = useTranslate();

	if ( areSiteDomainsLoaded && ! hasTitanSubscription ) {
		page( emailManagementPurchaseNewEmailAccount( siteSlug, selectedDomainName, currentRoute ) );

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

				<SectionHeader label={ title } className="titan-setup-mailbox__section-header" />

				<TitanSetupMailboxForm
					areSiteDomainsLoaded={ areSiteDomainsLoaded }
					selectedDomainName={ selectedDomainName }
				/>
			</Main>
		</>
	);
};

TitanSetupMailbox.propType = {
	selectedDomainName: PropTypes.string.isRequired,
};

export default TitanSetupMailbox;
