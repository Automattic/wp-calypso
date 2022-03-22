import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { useGetEmailDomainsQuery } from 'calypso/data/emails/use-get-email-domains-query';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailListActive from 'calypso/my-sites/email/email-management/home/email-list-active';
import EmailListInactive from 'calypso/my-sites/email/email-management/home/email-list-inactive';
import EmailNoDomain from 'calypso/my-sites/email/email-management/home/email-no-domain';
import EmailPlan from 'calypso/my-sites/email/email-management/home/email-plan';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparisonPage from 'calypso/my-sites/email/email-providers-stacked-comparison';
import { emailManagementTitanSetUpMailbox } from 'calypso/my-sites/email/paths';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

import './style.scss';

const ContentWithHeader = ( props: { children: ReactElement } ): ReactElement => {
	const translate = useTranslate();
	return (
		<Main wideLayout>
			<DocumentHead title={ translate( 'Emails', { textOnly: true } ) } />

			<EmailHeader />

			{ props.children }
		</Main>
	);
};

const NoAccess = (): ReactElement => {
	const translate = useTranslate();
	return (
		<ContentWithHeader>
			<EmptyContent
				title={ translate( 'You are not authorized to view this page' ) }
				illustration={ '/calypso/images/illustrations/illustration-404.svg' }
			/>
		</ContentWithHeader>
	);
};

const LoadingPlaceholder = (): ReactElement => {
	return (
		<ContentWithHeader>
			<>
				<SectionHeader className="email-home__section-placeholder is-placeholder" />
				<Card className="email-home__content-placeholder is-placeholder" />
			</>
		</ContentWithHeader>
	);
};

interface EmailManagementHomeProps {
	emailListInactiveHeader?: ReactElement;
	sectionHeaderLabel?: TranslateResult;
	selectedDomainName: string;
	selectedIntervalLength: IntervalLength;
	showActiveDomainList?: boolean;
	source: string;
}

const EmailHome = ( props: EmailManagementHomeProps ): ReactElement => {
	const {
		emailListInactiveHeader,
		showActiveDomainList = true,
		selectedDomainName,
		selectedIntervalLength,
		sectionHeaderLabel,
		source,
	} = props;

	const selectedSite = useSelector( getSelectedSite );

	const canManageSite = useSelector( ( state ) => {
		if ( ! selectedSite ) {
			return;
		}
		return canCurrentUser( state, selectedSite.ID, 'manage_options' );
	} );
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const hasSitesLoaded = useSelector( ( state ) => hasLoadedSites( state ) );

	const { data, isLoading: isSiteDomainLoading } = useGetEmailDomainsQuery(
		selectedSite?.ID ?? null,
		{
			retry: false,
		}
	);

	const domains = data?.domains?.map( createSiteDomainObject );

	if ( isSiteDomainLoading || ! hasSitesLoaded || ! selectedSite || ! domains ) {
		return <LoadingPlaceholder />;
	}

	if ( ! canManageSite ) {
		return <NoAccess />;
	}

	const domainHasEmail = ( domain: ResponseDomain ) =>
		hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) || hasEmailForwards( domain );

	if ( selectedDomainName ) {
		const selectedDomain =
			domains.find( ( domain: ResponseDomain ) => {
				return selectedDomainName === domain.name;
			} ) ?? ( {} as ResponseDomain );

		if ( ! domainHasEmail( selectedDomain ) ) {
			return (
				<EmailProvidersStackedComparisonPage
					comparisonContext="email-home-selected-domain"
					selectedDomainName={ selectedDomainName }
					source={ source }
				/>
			);
		}

		return (
			<ContentWithHeader>
				<EmailPlan selectedSite={ selectedSite } domain={ selectedDomain } source={ source } />
			</ContentWithHeader>
		);
	}

	const nonWpcomDomains = domains.filter( ( domain: ResponseDomain ) => ! domain.isWPCOMDomain );

	if ( nonWpcomDomains.length < 1 ) {
		return (
			<ContentWithHeader>
				<EmailNoDomain selectedSite={ selectedSite } source={ source } />
			</ContentWithHeader>
		);
	}

	const domainsWithEmail = nonWpcomDomains.filter( domainHasEmail );
	const domainsWithNoEmail = nonWpcomDomains.filter(
		( domain: ResponseDomain ) => ! domainHasEmail( domain )
	);

	if ( domainsWithEmail.length < 1 && domainsWithNoEmail.length === 1 ) {
		return (
			<EmailProvidersStackedComparisonPage
				comparisonContext="email-home-single-domain"
				selectedDomainName={ domainsWithNoEmail[ 0 ].name }
				source={ source }
				selectedIntervalLength={ selectedIntervalLength }
			/>
		);
	}

	if (
		domainsWithEmail.length === 1 &&
		domainsWithNoEmail.length === 0 &&
		domainsWithEmail[ 0 ].domain === selectedSite?.domain &&
		( domainsWithEmail[ 0 ].titanMailSubscription?.maximumMailboxCount ?? 0 ) > 0 &&
		domainsWithEmail[ 0 ].titanMailSubscription?.numberOfMailboxes === 0
	) {
		page( emailManagementTitanSetUpMailbox( selectedSite?.slug, selectedSite?.domain ) );
	}

	return (
		<ContentWithHeader>
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
		</ContentWithHeader>
	);
};

export default EmailHome;
