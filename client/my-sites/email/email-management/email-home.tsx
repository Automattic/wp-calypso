import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { useEmailsManagementDomainsQuery } from 'calypso/data/emails/use-emails-management-domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailListActive from 'calypso/my-sites/email/email-management/home/email-list-active';
import EmailListInactive from 'calypso/my-sites/email/email-management/home/email-list-inactive';
import EmailNoDomain from 'calypso/my-sites/email/email-management/home/email-no-domain';
import EmailPlan from 'calypso/my-sites/email/email-management/home/email-plan';
import EmailProvidersComparisonStacked from 'calypso/my-sites/email/email-providers-stacked-comparison';
import { emailManagementTitanSetUpMailbox } from 'calypso/my-sites/email/paths';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

import './style.scss';

interface EmailManagementHomeProps {
	emailListInactiveHeader: ReactElement;
	sectionHeaderLabel: TranslateResult;
	selectedDomainName: string;
	showActiveDomainList?: boolean;
	source: string;
}

function toTitleCase( words: string[] | string ): string {
	if ( typeof words === 'string' ) {
		words = words.trim().split( ' ' );
	}

	const result = words.map( function ( word ) {
		return word.charAt( 0 ).toUpperCase() + word.slice( 1 );
	} );

	return result.join( ' ' );
}

const EmailManagementHome = ( props: EmailManagementHomeProps ): ReactElement => {
	const {
		emailListInactiveHeader,
		showActiveDomainList = true,
		selectedDomainName,
		sectionHeaderLabel,
		source,
	} = props;

	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const canManageSite = useSelector( ( state ) =>
		canCurrentUser( state, selectedSite?.ID ?? 0, 'manage_options' )
	);
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const hasSitesLoaded = useSelector( ( state ) => hasLoadedSites( state ) );

	const { data, isFetched } = useEmailsManagementDomainsQuery( selectedSite?.ID ?? 0, {
		retry: false,
	} );

	const hasSiteDomainsLoaded = isFetched;
	const domains = data?.domains?.map( createSiteDomainObject );

	const renderContentWithHeader = ( content: ReactElement ) => {
		return (
			<Main wideLayout>

				<DocumentHead title={ toTitleCase( translate( 'Emails', { textOnly: true } ) ) } />

				<SidebarNavigation />

				<EmailHeader />

				{ content }

			</Main>
		);
	};

	const renderNoAccess = () => {
		return renderContentWithHeader(
			<>
				<EmptyContent
					title={ translate( 'You are not authorized to view this page' ) }
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
				/>
			</>
		);
	};

	const renderLoadingPlaceholder = (): ReactElement => {
		return renderContentWithHeader(
			<>
				<SectionHeader className="email-home__section-placeholder is-placeholder" />
				<Card className="email-home__content-placeholder is-placeholder" />
			</>
		);
	};

	if ( ! hasSiteDomainsLoaded || ! hasSitesLoaded || ! selectedSite ) {
		return renderLoadingPlaceholder();
	}

	if ( ! canManageSite ) {
		return renderNoAccess();
	}

	const domainHasEmail = ( domain: ResponseDomain ) =>
		hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) || hasEmailForwards( domain );

	if ( selectedDomainName ) {
		const selectedDomain = domains.find( ( domain: ResponseDomain ) => {
			return selectedDomainName === domain.name;
		} );

		if ( ! domainHasEmail( selectedDomain ) ) {
			return (
				<EmailProvidersComparisonStacked
					comparisonContext="email-home-selected-domain"
					selectedDomainName={ selectedDomainName }
					source={ source }
				/>
			);
		}

		return renderContentWithHeader(
			<EmailPlan selectedSite={ selectedSite } domain={ selectedDomain } source={ source } />
		);
	}

	const nonWpcomDomains = domains.filter( ( domain: ResponseDomain ) => ! domain.isWPCOMDomain );

	if ( nonWpcomDomains.length < 1 ) {
		return renderContentWithHeader(
			<EmailNoDomain selectedSite={ selectedSite } source={ source } />
		);
	}

	const domainsWithEmail = nonWpcomDomains.filter( domainHasEmail );
	const domainsWithNoEmail = nonWpcomDomains.filter(
		( domain: ResponseDomain ) => ! domainHasEmail( domain )
	);

	if ( domainsWithEmail.length < 1 && domainsWithNoEmail.length === 1 ) {
		return (
			<EmailProvidersComparisonStacked
				comparisonContext="email-home-single-domain"
				selectedDomainName={ domainsWithNoEmail[ 0 ].name }
				source={ source }
			/>
		);
	}

	if (
		domainsWithEmail.length === 1 &&
		domainsWithNoEmail.length === 0 &&
		domainsWithEmail[ 0 ].domain === selectedSite?.domain &&
		domainsWithEmail[ 0 ].titanMailSubscription?.maximumMailboxCount > 0 &&
		domainsWithEmail[ 0 ].titanMailSubscription?.numberOfMailboxes === 0
	) {
		page( emailManagementTitanSetUpMailbox( selectedSite?.slug, selectedSite?.domain ) );
	}

	return renderContentWithHeader(
		<>
			{ showActiveDomainList && (
				<EmailListActive
					currentRoute={ currentRoute }
					domains={ domainsWithEmail }
					selectedSiteId={ selectedSite?.ID }
					selectedSiteSlug={ selectedSite?.slug }
					source={ source }
				/>
			) }

			<EmailListInactive
				currentRoute={ currentRoute }
				domains={ domainsWithNoEmail }
				headerComponent={ emailListInactiveHeader }
				sectionHeaderLabel={ sectionHeaderLabel }
				selectedSiteSlug={ selectedSite?.slug }
				source={ source }
			/>
		</>
	);
};

export default EmailManagementHome;
