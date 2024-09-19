import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getConfiguredTitanMailboxCount,
	getMaxTitanMailboxCount,
	getTitanProductName,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	getPurchaseNewEmailAccountPath,
	getEmailManagementPath,
} from 'calypso/my-sites/email/paths';
import TitanSetUpMailboxForm from 'calypso/my-sites/email/titan-set-up-mailbox/titan-set-up-mailbox-form';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface TitanSetUpMailboxProps {
	selectedDomainName: string;
	source: string;
}

const TitanSetUpMailbox = ( { selectedDomainName, source }: TitanSetUpMailboxProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	const currentRoute = useSelector( getCurrentRoute );

	const previousRoute = useSelector( getPreviousRoute );

	const { data: allDomains = [] } = useGetDomainsQuery( selectedSiteId, {
		retry: false,
	} );
	const domains = allDomains.map( createSiteDomainObject );

	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );

	const hasTitanSubscription = hasTitanMailWithUs( selectedDomain );

	const handleBack = useCallback( () => {
		page( previousRoute );
	}, [ previousRoute ] );

	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	useEffect( () => {
		if ( selectedDomain && ! hasTitanSubscription ) {
			page.redirect(
				getPurchaseNewEmailAccountPath( selectedSiteSlug, selectedDomainName, currentRoute, source )
			);
		}

		if ( selectedDomain && hasTitanSubscription ) {
			const configuredMailboxCount = getConfiguredTitanMailboxCount( selectedDomain );
			const maxMailboxCount = getMaxTitanMailboxCount( selectedDomain );

			if ( configuredMailboxCount === maxMailboxCount ) {
				page.redirect( getEmailManagementPath( selectedSiteSlug, selectedDomainName ) );
			}
		}
	}, [
		currentRoute,
		hasTitanSubscription,
		selectedDomain,
		selectedDomainName,
		selectedSiteSlug,
		source,
	] );

	const title = translate( 'Set up mailbox' );

	return (
		<>
			{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }

			<Main wideLayout>
				<DocumentHead title={ titleCase( title ) } />

				<EmailHeader />

				<HeaderCake onClick={ handleBack }>
					{ getTitanProductName() + ': ' + selectedDomainName }
				</HeaderCake>

				<SectionHeader label={ title } className="titan-set-up-mailbox__section-header" />

				<TitanSetUpMailboxForm
					areSiteDomainsLoaded={ Boolean( selectedDomain ) }
					selectedDomainName={ selectedDomainName }
				/>
			</Main>
		</>
	);
};

export default TitanSetUpMailbox;
