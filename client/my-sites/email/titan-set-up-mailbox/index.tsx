import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasTitanMailWithUs, getTitanProductName } from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import TitanSetUpMailboxForm from 'calypso/my-sites/email/titan-set-up-mailbox/titan-set-up-mailbox-form';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface TitanSetUpMailboxProps {
	selectedDomainName: string;
	source: string;
}

const TitanSetUpMailbox = ( { selectedDomainName, source }: TitanSetUpMailboxProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	const currentRoute = useSelector( getCurrentRoute );

	const previousRoute = useSelector( getPreviousRoute );

	const domains = useSelector( ( state ) =>
		getDomainsBySiteId( state, selectedSiteId ?? undefined )
	);

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
				emailManagementPurchaseNewEmailAccount(
					selectedSiteSlug ?? '',
					selectedDomainName,
					currentRoute,
					source
				)
			);
		}
	}, [
		selectedDomain,
		currentRoute,
		hasTitanSubscription,
		selectedDomainName,
		selectedSiteSlug,
		source,
	] );

	const title = translate( 'Set up mailbox' );

	return (
		<>
			{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }

			<Main wideLayout={ true }>
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
