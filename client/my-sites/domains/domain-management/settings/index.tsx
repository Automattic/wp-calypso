import { Button } from '@automattic/components';
import { englishLocales } from '@automattic/i18n-utils';
import { useEffect } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import { removeQueryArgs } from '@wordpress/url';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import page from 'page';
import { connect } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Accordion from 'calypso/components/domains/accordion';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isDomainInGracePeriod, isDomainUpdateable } from 'calypso/lib/domains';
import { transferStatus, type as domainTypes } from 'calypso/lib/domains/constants';
import { findRegistrantWhois } from 'calypso/lib/domains/whois/utils';
import DomainDeleteInfoCard from 'calypso/my-sites/domains/domain-management/components/domain/domain-info-card/delete';
import DomainDisconnectCard from 'calypso/my-sites/domains/domain-management/components/domain/domain-info-card/disconnect';
import DomainEmailInfoCard from 'calypso/my-sites/domains/domain-management/components/domain/domain-info-card/email';
import DomainTransferInfoCard from 'calypso/my-sites/domains/domain-management/components/domain/domain-info-card/transfer';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import { WPCOM_DEFAULT_NAMESERVERS_REGEX } from 'calypso/my-sites/domains/domain-management/name-servers/constants';
import withDomainNameservers from 'calypso/my-sites/domains/domain-management/name-servers/with-domain-nameservers';
import {
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementList,
	domainUseMyDomain,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import { requestWhois } from 'calypso/state/domains/management/actions';
import { getWhoisData } from 'calypso/state/domains/management/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { canAnySiteConnectDomains } from 'calypso/state/selectors/can-any-site-connect-domains';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { IAppState } from 'calypso/state/types';
import ConnectedDomainDetails from './cards/connected-domain-details';
import ContactsPrivacyInfo from './cards/contact-information/contacts-privacy-info';
import ContactVerificationCard from './cards/contact-verification-card';
import DomainForwardingCard from './cards/domain-forwarding-card';
import DomainOnlyConnectCard from './cards/domain-only-connect';
import DomainSecurityDetails from './cards/domain-security-details';
import NameServersCard from './cards/name-servers-card';
import RegisteredDomainDetails from './cards/registered-domain-details';
import SiteRedirectCard from './cards/site-redirect-card';
import TransferredDomainDetails from './cards/transferred-domain-details';
import DnsRecords from './dns';
import { getSslReadableStatus, isSecuredWithUs } from './helpers';
import SetAsPrimary from './set-as-primary';
import SettingsHeader from './settings-header';
import type { SettingsPageConnectedProps, SettingsPageProps } from './types';

const Settings = ( {
	currentRoute,
	domain,
	domains,
	isLoadingPurchase,
	isLoadingNameservers,
	loadingNameserversError,
	nameservers,
	dns,
	purchase,
	requestWhois,
	selectedDomainName,
	selectedSite,
	updateNameservers,
	whoisData,
}: SettingsPageProps ) => {
	const translate = useTranslate();
	const contactInformation = findRegistrantWhois( whoisData );

	const queryParams = new URLSearchParams( window.location.search );

	useEffect( () => {
		if ( ! contactInformation ) {
			requestWhois( selectedDomainName );
		}
	}, [ contactInformation, requestWhois, selectedDomainName ] );

	const hasConnectableSites = useSelector( ( state ) => canAnySiteConnectDomains( state ) );

	const renderHeader = () => {
		const previousPath = domainManagementList(
			selectedSite?.slug,
			currentRoute,
			selectedSite?.options?.is_domain_only
		);

		const items = [
			{
				label: isUnderDomainManagementAll( currentRoute )
					? translate( 'All Domains' )
					: translate( 'Domains' ),
				href: previousPath,
			},
			{ label: selectedDomainName },
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return (
			<DomainHeader
				items={ items }
				mobileItem={ mobileItem }
				titleOverride={
					domain ? (
						<SettingsHeader domain={ domain } site={ selectedSite } purchase={ purchase } />
					) : null
				}
			/>
		);
	};

	const renderSecurityAccordion = () => {
		if ( ! domain ) {
			return null;
		}
		if ( ! isSecuredWithUs( domain ) ) {
			return null;
		}
		if (
			domain.type === domainTypes.SITE_REDIRECT ||
			domain.type === domainTypes.TRANSFER ||
			domain.transferStatus === transferStatus.PENDING_ASYNC
		) {
			return null;
		}

		return (
			<Accordion
				title={ translate( 'Domain security', { textOnly: true } ) }
				subtitle={ getSslReadableStatus( domain ) }
				key="security"
				isDisabled={ domain.isMoveToNewSitePending }
			>
				<DomainSecurityDetails
					domain={ domain }
					selectedSite={ selectedSite }
					purchase={ purchase }
					isLoadingPurchase={ isLoadingPurchase }
				/>
			</Accordion>
		);
	};

	const renderStatusSection = () => {
		if (
			! ( domain && selectedSite?.options?.is_domain_only ) ||
			domain.type === domainTypes.TRANSFER
		) {
			return null;
		}

		return (
			<Accordion
				title={ translate( 'Create a WordPress.com site', { textOnly: true } ) }
				key="status"
				expanded
				isDisabled={ domain.isMoveToNewSitePending }
			>
				<DomainOnlyConnectCard
					selectedDomainName={ domain.domain }
					selectedSite={ selectedSite }
					hasConnectableSites={ hasConnectableSites }
				/>
			</Accordion>
		);
	};

	const renderDetailsSection = () => {
		if ( ! domain ) {
			return null;
		}
		if ( domain.type === domainTypes.REGISTERED ) {
			return (
				<Accordion
					title={ translate( 'Details', { textOnly: true } ) }
					subtitle={ translate( 'Registration and auto-renew', { textOnly: true } ) }
					key="main"
					expanded={ ! selectedSite?.options?.is_domain_only && ! domain.isMoveToNewSitePending }
					isDisabled={ domain.isMoveToNewSitePending }
				>
					<RegisteredDomainDetails
						domain={ domain }
						selectedSite={ selectedSite }
						purchase={ purchase }
						isLoadingPurchase={ isLoadingPurchase }
					/>
				</Accordion>
			);
		} else if ( domain.type === domainTypes.MAPPED ) {
			return (
				<Accordion
					title={ translate( 'Details', { textOnly: true } ) }
					subtitle={ translate( 'Domain connection details', { textOnly: true } ) }
					key="main"
					expanded
				>
					<ConnectedDomainDetails
						domain={ domain }
						selectedSite={ selectedSite }
						purchase={ purchase }
						isLoadingPurchase={ isLoadingPurchase }
					/>
				</Accordion>
			);
		} else if ( domain.type === domainTypes.TRANSFER ) {
			return (
				<Accordion
					title={ translate( 'Details', { textOnly: true } ) }
					subtitle={ translate( 'Transfer details', { textOnly: true } ) }
					key="main"
					expanded
				>
					<TransferredDomainDetails
						domain={ domain }
						selectedSite={ selectedSite }
						purchase={ purchase }
						isLoadingPurchase={ isLoadingPurchase }
					/>
				</Accordion>
			);
		} else if ( domain.type === domainTypes.SITE_REDIRECT ) {
			return (
				<Accordion
					title={ translate( 'Redirect settings', { textOnly: true } ) }
					subtitle={ translate( 'Update your site redirect' ) }
					key="main"
					expanded
				>
					<SiteRedirectCard
						selectedSite={ selectedSite }
						selectedDomainName={ selectedDomainName }
					/>
				</Accordion>
			);
		}
	};

	const areAllWpcomNameServers = () => {
		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return nameservers.every( ( nameserver: string ) => {
			return ! nameserver || WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	const getNameServerSectionSubtitle = () => {
		if ( isLoadingNameservers ) {
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			return <span className="name-servers-card__loading" />;
		}

		if ( loadingNameserversError ) {
			return translate( 'There was an error loading the name servers for this domain', {
				textOnly: true,
			} );
		}

		return areAllWpcomNameServers()
			? translate( 'Your domain is using WordPress.com name servers', { textOnly: true } )
			: translate( 'Your domain is using custom name servers', { textOnly: true } );
	};

	const renderNameServersSection = () => {
		if ( ! domain ) {
			return null;
		}
		if ( domain.type !== domainTypes.REGISTERED ) {
			return null;
		}

		const onClose = () => {
			page.redirect(
				window.location.pathname + removeQueryArgs( window.location.search, 'nameservers' )
			);
		};

		return (
			<Accordion
				title={ translate( 'Name servers', { textOnly: true } ) }
				subtitle={ getNameServerSectionSubtitle() }
				expanded={ queryParams.get( 'nameservers' ) === 'true' }
				onClose={ onClose }
				isDisabled={ domain.isMoveToNewSitePending }
			>
				{ domain.canManageNameServers ? (
					<NameServersCard
						domain={ domain }
						isLoadingNameservers={ isLoadingNameservers }
						loadingNameserversError={ loadingNameserversError }
						nameservers={ nameservers }
						selectedSite={ selectedSite }
						selectedDomainName={ selectedDomainName }
						updateNameservers={ updateNameservers }
					/>
				) : (
					<InfoNotice redesigned text={ domain.cannotManageNameServersReason } />
				) }
			</Accordion>
		);
	};

	const renderExternalNameserversNotice = ( noticeType: string ) => {
		if ( areAllWpcomNameServers() || ! nameservers || ! nameservers.length ) {
			return null;
		}

		const dnsRecordsNotice = translate(
			"Your domain is using external name servers so the DNS records you're editing won't be in effect until you switch to use WordPress.com name servers. {{a}}Update your name servers now{{/a}}.",
			{
				components: {
					a: (
						<a
							href={ domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute, {
								nameservers: true,
							} ) }
						/>
					),
				},
			}
		);

		const domainForwardingNotice = translate(
			"Your domain is using external name servers so the Domain Forwarding records you're editing won't be in effect until you switch to use WordPress.com name servers. {{a}}Update your name servers now{{/a}}.",
			{
				components: {
					a: (
						<a
							href={ domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute, {
								nameservers: true,
							} ) }
						/>
					),
				},
			}
		);

		const notice = noticeType === 'DNS' ? dnsRecordsNotice : domainForwardingNotice;

		return (
			<div className="dns-records-card-notice">
				<Icon
					icon={ info }
					size={ 18 }
					className="dns-records-card-notice__icon gridicon"
					viewBox="2 2 20 20"
				/>
				<div className="dns-records-card-notice__message">{ notice }</div>
			</div>
		);
	};

	const renderDnsRecords = () => {
		if (
			! domain ||
			domain.type === domainTypes.SITE_REDIRECT ||
			domain.transferStatus === transferStatus.PENDING_ASYNC ||
			! domain.canManageDnsRecords
		) {
			return null;
		}

		return (
			<div className="dns-records-card">
				<Accordion
					title={ translate( 'DNS records', { textOnly: true } ) }
					subtitle={ translate( 'Connect your domain to other services', { textOnly: true } ) }
					isDisabled={ domain.isMoveToNewSitePending }
				>
					{ domain.canManageDnsRecords ? (
						<>
							{ renderExternalNameserversNotice( 'DNS' ) }
							<DnsRecords
								dns={ dns }
								selectedDomainName={ selectedDomainName }
								selectedSite={ selectedSite }
								currentRoute={ currentRoute }
							/>
						</>
					) : (
						<InfoNotice redesigned text={ domain.cannotManageDnsRecordsReason } />
					) }
				</Accordion>
			</div>
		);
	};

	const renderForwardingSection = () => {
		if (
			! domain ||
			domain.type === domainTypes.SITE_REDIRECT ||
			domain.transferStatus === transferStatus.PENDING_ASYNC ||
			! domain.canManageDnsRecords
		) {
			return null;
		}

		let translatedTitle;
		if (
			englishLocales.includes( getLocaleSlug() || '' ) ||
			i18n.hasTranslation( 'Domain forwarding' )
		) {
			translatedTitle = translate( 'Domain forwarding', { textOnly: true } );
		} else {
			translatedTitle = translate( 'Domain Forwarding', { textOnly: true } );
		}

		return (
			<Accordion
				className="domain-forwarding-card__accordion"
				title={ translatedTitle }
				subtitle={ translate( 'Forward your domain to another' ) }
				isDisabled={ domain.isMoveToNewSitePending }
			>
				{ renderExternalNameserversNotice( 'DOMAIN_FORWARDING' ) }
				<DomainForwardingCard
					domain={ domain }
					areAllWpcomNameServers={ areAllWpcomNameServers() }
				/>
			</Accordion>
		);
	};

	const renderSetAsPrimaryDomainSection = () => {
		if ( ! domain ) {
			return null;
		}
		return <SetAsPrimary domain={ domain } selectedSite={ selectedSite } key="set-as-primary" />;
	};

	const renderDomainSecuritySection = () => {
		return renderSecurityAccordion();
	};

	const renderContactInformationSecion = () => {
		if ( ! domain ) {
			return null;
		}
		if (
			domain.type !== domainTypes.REGISTERED ||
			( ! isDomainUpdateable( domain ) && ! isDomainInGracePeriod( domain ) )
		) {
			return null;
		}

		const getPlaceholderAccordion = () => {
			const label = translate( 'Contact information', { textOnly: true } );
			return (
				<Accordion
					title={ label }
					subtitle={ label }
					isPlaceholder
					isDisabled={ domain.isMoveToNewSitePending }
				></Accordion>
			);
		};

		if ( ! domain || ! domains ) {
			return getPlaceholderAccordion();
		}

		const getContactsPrivacyInfo = () => (
			<ContactsPrivacyInfo
				domains={ domains }
				selectedSite={ selectedSite }
				selectedDomainName={ selectedDomainName }
			></ContactsPrivacyInfo>
		);

		const { privateDomain } = domain;
		const titleLabel = translate( 'Contact information', { textOnly: true } );
		const privacyProtectionLabel = privateDomain
			? translate( 'Privacy protection on', { textOnly: true } )
			: translate( 'Privacy protection off', { textOnly: true } );

		if ( ! domain.currentUserCanManage ) {
			return (
				<Accordion
					isDisabled={ domain.isMoveToNewSitePending }
					title={ titleLabel }
					subtitle={ `${ privacyProtectionLabel }` }
				>
					{ getContactsPrivacyInfo() }
				</Accordion>
			);
		}

		if ( ! contactInformation ) {
			return getPlaceholderAccordion();
		}

		const contactInfoFullName = `${ contactInformation.fname } ${ contactInformation.lname }`;

		return (
			<Accordion
				title={ titleLabel }
				subtitle={ `${ contactInfoFullName }, ${ privacyProtectionLabel.toLowerCase() }` }
				isDisabled={ domain.isMoveToNewSitePending }
			>
				{ getContactsPrivacyInfo() }
			</Accordion>
		);
	};

	const handleTransferDomainClick = () => {
		if ( ! domain ) {
			return;
		}
		recordTracksEvent( 'calypso_domain_management_mapped_transfer_click', {
			section: domain.type,
			domain: domain.name,
		} );
	};

	const renderTranferInMappedDomainSection = () => {
		if ( ! ( domain?.isEligibleForInboundTransfer && domain?.type === domainTypes.MAPPED ) ) {
			return null;
		}

		return (
			<Accordion
				title={ translate( 'Transfer your domain to WordPress.com', { textOnly: true } ) }
				subtitle={ translate( 'Manage your site and domain all in one place', { textOnly: true } ) }
			>
				<Button
					onClick={ handleTransferDomainClick }
					href={ domainUseMyDomain(
						selectedSite?.slug,
						domain.name,
						useMyDomainInputMode.transferDomain
					) }
					primary={ true }
				>
					{ translate( 'Transfer' ) }
				</Button>
			</Accordion>
		);
	};

	const renderContactVerificationSection = () => {
		if ( ! domain || ! domain.currentUserCanManage ) {
			return null;
		}

		// Show the card only if the domain requires a verification from Nominet (or if it has been already suspended)
		if ( ! domain.nominetDomainSuspended && ! domain.nominetPendingContactVerificationRequest ) {
			return null;
		}

		const contactInformationUpdateLink =
			selectedSite &&
			domain &&
			domainManagementEditContactInfo( selectedSite?.slug, domain.name, currentRoute );

		return (
			<Accordion
				expanded={ true }
				title={ translate( 'Contact verification', { textOnly: true } ) }
				subtitle={ translate( 'Additional contact verification required for your domain', {
					textOnly: true,
				} ) }
				isDisabled={ domain.isMoveToNewSitePending }
			>
				<ContactVerificationCard
					contactInformation={ contactInformation }
					contactInformationUpdateLink={ contactInformationUpdateLink }
					selectedDomainName={ selectedDomainName }
				/>
			</Accordion>
		);
	};

	const renderMainContent = () => {
		// TODO: If it's a registered domain or transfer and the domain's registrar is in maintenance, show maintenance card
		if ( ! domain ) {
			return undefined;
		}
		return (
			<>
				{ renderStatusSection() }
				{ renderDetailsSection() }
				{ renderTranferInMappedDomainSection() }
				{ renderSetAsPrimaryDomainSection() }
				{ renderNameServersSection() }
				{ renderDnsRecords() }
				{ renderForwardingSection() }
				{ renderContactInformationSecion() }
				{ renderContactVerificationSection() }
				{ renderDomainSecuritySection() }
			</>
		);
	};

	const renderSettingsCards = () => {
		if ( ! domain ) {
			return undefined;
		}
		return (
			<>
				<DomainEmailInfoCard selectedSite={ selectedSite } domain={ domain } />
				<DomainTransferInfoCard selectedSite={ selectedSite } domain={ domain } />
				<DomainDeleteInfoCard selectedSite={ selectedSite } domain={ domain } />
				<DomainDisconnectCard selectedSite={ selectedSite } domain={ domain } />
			</>
		);
	};

	if ( ! domain ) {
		// TODO: Update this placeholder
		return <DomainMainPlaceholder breadcrumbs={ renderHeader } />;
	}

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Main wideLayout className="domain-settings-page">
			{ selectedSite?.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite?.ID } /> }
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderHeader() }
			<TwoColumnsLayout content={ renderMainContent() } sidebar={ renderSettingsCards() } />
		</Main>
	);
};

export default connect(
	( state: IAppState, ownProps: SettingsPageProps ): SettingsPageConnectedProps => {
		const domain = ownProps.domains && getSelectedDomain( ownProps );
		const subscriptionId = domain && domain.subscriptionId;
		const currentUserId = getCurrentUserId( state );
		const purchase = subscriptionId
			? getByPurchaseId( state, parseInt( subscriptionId, 10 ) )
			: null;
		return {
			whoisData: getWhoisData( state, ownProps.selectedDomainName ),
			currentRoute: getCurrentRoute( state ),
			domain: getSelectedDomain( { ...ownProps, isSiteRedirect: true } ),
			isLoadingPurchase:
				isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
			purchase: purchase && purchase.userId === currentUserId ? purchase : null,
			dns: getDomainDns( state, ownProps.selectedDomainName ),
		};
	},
	{
		requestWhois,
		recordTracksEvent,
	}
)( withDomainNameservers( Settings ) );
