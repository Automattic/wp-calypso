import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
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
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface TitanSetUpMailboxProps {
	selectedDomainName: string;
	source: string;
}

const TitanSetUpMailbox = ( { selectedDomainName, source }: TitanSetUpMailboxProps ) => {
	const selectedSite = useSelector( getSelectedSite );

	const currentRoute = useSelector( getCurrentRoute );

	const previousRoute = useSelector( getPreviousRoute );

	const domains = useSelector( ( state ) =>
		getDomainsBySiteId( state, selectedSite?.ID ?? undefined )
	);

	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );

	const hasTitanSubscription = hasTitanMailWithUs( selectedDomain );

	const areSiteDomainsLoaded = useSelector( ( state ) =>
		hasLoadedSiteDomains( state, selectedSite?.ID ?? null )
	);

	const handleBack = useCallback( () => {
		page( previousRoute );
	}, [ previousRoute ] );

	const translate = useTranslate();

	if ( areSiteDomainsLoaded && ! hasTitanSubscription ) {
		const siteSlug = selectedSite?.slug ?? null;

		if ( siteSlug ) {
			page(
				emailManagementPurchaseNewEmailAccount( siteSlug, selectedDomainName, currentRoute, source )
			);
		}

		return null;
	}

	const title = translate( 'Set up mailbox' );

	return (
		<>
			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout={ true }>
				<DocumentHead title={ title } />

				<EmailHeader />

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

export default TitanSetUpMailbox;
