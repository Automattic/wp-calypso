/**
 * External dependencies
 */
import page from 'page';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	emailManagementPurchaseNewEmailAccount,
	emailManagementTitanSetupMailbox,
} from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import TitanSetupMailboxForm from 'calypso/my-sites/email/titan-setup-mailbox/titan-setup-mailbox-form';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';

const TitanSetupMailbox = ( { selectedDomainName } ) => {
	const selectedSite = useSelector( getSelectedSite );

	const currentRoute = useSelector( getCurrentRoute );

	const siteId = selectedSite?.ID ?? null;

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );

	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );

	const hasTitanSubscription = hasTitanMailWithUs( selectedDomain );

	const areSiteDomainsLoaded = useSelector( ( state ) => hasLoadedSiteDomains( state, siteId ) );

	const analyticsPath = emailManagementTitanSetupMailbox( ':site', ':domain', currentRoute );

	const siteSlug = selectedSite?.slug ?? null;

	const goToCustomerHome = useCallback( () => {
		page.redirect( `/home/${ siteSlug }` );
	}, [ siteSlug ] );

	const translate = useTranslate();

	if ( areSiteDomainsLoaded && ! hasTitanSubscription ) {
		page( emailManagementPurchaseNewEmailAccount( siteSlug, selectedDomainName, currentRoute ) );

		return null;
	}

	return (
		<>
			<PageViewTracker
				path={ analyticsPath }
				title="Email Management > Set up your Professional Email"
			/>

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'Set up your Professional Email' ) } />

				<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

				<HeaderCake onClick={ goToCustomerHome }>
					{ translate( 'Set up your Professional Email' ) }
				</HeaderCake>

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
