import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { useIsLoading as useAddEmailForwardMutationIsLoading } from 'calypso/data/emails/use-add-email-forward-mutation';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { getConfiguredTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailListActive from 'calypso/my-sites/email/email-management/home/email-list-active';
import EmailListInactive from 'calypso/my-sites/email/email-management/home/email-list-inactive';
import EmailNoDomain from 'calypso/my-sites/email/email-management/home/email-no-domain';
import EmailPlan from 'calypso/my-sites/email/email-management/home/email-plan';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparisonPage from 'calypso/my-sites/email/email-providers-comparison/stacked';
import { getTitanSetUpMailboxPath, getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

import './style.scss';

const ContentWithHeader = ( props: { children: ReactNode } ) => {
	const translate = useTranslate();
	return (
		<Main wideLayout>
			<DocumentHead title={ translate( 'Emails', { textOnly: true } ) } />

			<EmailHeader />

			{ props.children }
		</Main>
	);
};

const NoAccess = () => {
	const translate = useTranslate();
	return (
		<ContentWithHeader>
			<EmptyContent
				title={ translate( 'You are not authorized to view this page' ) }
				illustration="/calypso/images/illustrations/illustration-404.svg"
			/>
		</ContentWithHeader>
	);
};

const LoadingPlaceholder = () => {
	return (
		<ContentWithHeader>
			<SectionHeader className="email-home__section-placeholder is-placeholder" />
			<Card className="email-home__content-placeholder is-placeholder" />
		</ContentWithHeader>
	);
};

interface EmailManagementHomeProps {
	emailListInactiveHeader?: ReactNode;
	sectionHeaderLabel?: TranslateResult;
	selectedDomainName?: string;
	selectedEmailProviderSlug?: string;
	selectedIntervalLength?: IntervalLength;
	showActiveDomainList?: boolean;
	source: string;
	context?: 'domains' | 'email' | string;
}

const domainHasEmail = ( domain: ResponseDomain ) =>
	hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) || hasEmailForwards( domain );

const EmailHome = ( props: EmailManagementHomeProps ) => {
	const {
		emailListInactiveHeader,
		selectedEmailProviderSlug,
		showActiveDomainList = true,
		selectedDomainName,
		selectedIntervalLength,
		sectionHeaderLabel,
		source,
		context,
	} = props;

	const selectedSite = useSelector( getSelectedSite );

	const canManageSite = useSelector( ( state ) => {
		if ( ! selectedSite ) {
			return;
		}
		return canCurrentUser( state, selectedSite.ID, 'manage_options' );
	} );
	const hasSitesLoaded = useSelector( hasLoadedSites );
	const isAllDomainManagementContext = context === 'domains';

	const addEmailForwardMutationActive = useAddEmailForwardMutationIsLoading();

	const { data: allDomains = [], isLoading: isSiteDomainLoading } = useGetDomainsQuery(
		selectedSite?.ID ?? null,
		{
			refetchOnMount: ! addEmailForwardMutationActive,
			retry: false,
		}
	);

	const domains = allDomains.map( createSiteDomainObject );
	const nonWpcomDomains = domains.filter( ( domain ) => ! domain.isWPCOMDomain );

	const domainsWithEmail = nonWpcomDomains.filter( domainHasEmail );
	const domainsWithNoEmail = nonWpcomDomains.filter( ( domain ) => ! domainHasEmail( domain ) );

	const isSingleDomainThatHasEmail =
		domainsWithEmail.length === 1 && domainsWithNoEmail.length === 0;

	if ( isSiteDomainLoading || ! hasSitesLoaded || ! selectedSite || ! domains ) {
		return <LoadingPlaceholder />;
	}

	if ( ! canManageSite ) {
		return <NoAccess />;
	}

	if ( selectedDomainName ) {
		const selectedDomain =
			domains.find( ( domain ) => selectedDomainName === domain.name ) ?? ( {} as ResponseDomain );

		if ( ! domainHasEmail( selectedDomain ) ) {
			return (
				<EmailProvidersStackedComparisonPage
					className={ clsx( { 'context-all-domain-management': isAllDomainManagementContext } ) }
					comparisonContext="email-home-selected-domain"
					selectedDomainName={ selectedDomainName }
					selectedEmailProviderSlug={ selectedEmailProviderSlug }
					selectedIntervalLength={ selectedIntervalLength }
					source={ source }
					hideNavigation={ isAllDomainManagementContext }
				/>
			);
		}

		return (
			<ContentWithHeader>
				<EmailPlan
					domain={ selectedDomain }
					// When users have a single domain with email, they are auto-redirected from the
					// `/email/:site_slug` page to `/email/:domain/manage/:site_slug`. That's why
					// we also hide the back button, to avoid scenarios where clicking "Back"
					// redirects users to the same page as they are currently on.
					hideHeaderCake={ isSingleDomainThatHasEmail }
					selectedSite={ selectedSite }
					source={ source }
				/>
			</ContentWithHeader>
		);
	}

	if ( nonWpcomDomains.length < 1 ) {
		return (
			<ContentWithHeader>
				<EmailNoDomain selectedSite={ selectedSite } source={ source } />
			</ContentWithHeader>
		);
	}

	if ( domainsWithEmail.length < 1 && domainsWithNoEmail.length === 1 ) {
		return (
			<EmailProvidersStackedComparisonPage
				comparisonContext="email-home-single-domain"
				hideNavigation
				selectedDomainName={ domainsWithNoEmail[ 0 ].name }
				selectedEmailProviderSlug={ selectedEmailProviderSlug }
				selectedIntervalLength={ selectedIntervalLength }
				source={ source }
			/>
		);
	}

	if ( isSingleDomainThatHasEmail ) {
		if (
			( domainsWithEmail[ 0 ].titanMailSubscription?.maximumMailboxCount ?? 0 ) > 0 &&
			getConfiguredTitanMailboxCount( domainsWithEmail[ 0 ] ) === 0
		) {
			page.redirect( getTitanSetUpMailboxPath( selectedSite.slug, domainsWithEmail[ 0 ].domain ) );
			return null;
		}

		page.redirect( getEmailManagementPath( selectedSite.slug, domainsWithEmail[ 0 ].domain ) );
		return null;
	}

	return (
		<ContentWithHeader>
			{ showActiveDomainList && <EmailListActive domains={ domainsWithEmail } source={ source } /> }

			<EmailListInactive
				domains={ domainsWithNoEmail }
				headerComponent={ emailListInactiveHeader }
				sectionHeaderLabel={ sectionHeaderLabel }
				source={ source }
			/>
		</ContentWithHeader>
	);
};

export default EmailHome;
