import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Accordion from 'calypso/components/domains/accordion';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isDomainInGracePeriod, isDomainUpdateable } from 'calypso/lib/domains';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { findRegistrantWhois } from 'calypso/lib/domains/whois/utils';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import DomainDeleteInfoCard from 'calypso/my-sites/domains/domain-management/components/domain/domain-info-card/delete';
import DomainEmailInfoCard from 'calypso/my-sites/domains/domain-management/components/domain/domain-info-card/email';
import DomainTransferInfoCard from 'calypso/my-sites/domains/domain-management/components/domain/domain-info-card/transfer';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import ContactsPrivacyInfo from 'calypso/my-sites/domains/domain-management/contacts-privacy/contacts-privacy-info';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { requestWhois } from 'calypso/state/domains/management/actions';
import { getWhoisData } from 'calypso/state/domains/management/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import ConnectedDomainDetails from './cards/connected-domain-details';
import DomainSecurityDetails from './cards/domain-security-details';
import RegisteredDomainDetails from './cards/registered-domain-details';
import { getSslReadableStatus, isSecuredWithUs } from './helpers';
import SetAsPrimary from './set-as-primary';
import SettingsHeader from './settings-header';
import type { SettingsPageConnectedProps, SettingsPageProps } from './types';

const Settings = ( {
	currentRoute,
	domain,
	domains,
	isLoadingPurchase,
	purchase,
	selectedDomainName,
	selectedSite,
	whoisData,
	requestWhois,
}: SettingsPageProps ): JSX.Element => {
	const translate = useTranslate();

	const renderBreadcrumbs = () => {
		const previousPath = domainManagementEdit(
			selectedSite?.slug,
			selectedDomainName,
			currentRoute
		);

		const items = [
			{
				label: translate( 'Domains' ),
				href: domainManagementList( selectedSite?.slug, selectedDomainName ),
			},
			{ label: selectedDomainName },
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	const renderSecurityAccordion = () => {
		if ( ! isSecuredWithUs( domain ) ) return null;

		return (
			<Accordion
				title={ translate( 'Domain security', { textOnly: true } ) }
				subtitle={ getSslReadableStatus( domain ) }
				key="security"
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

	const renderDetailsSection = () => {
		if ( domain.type === domainTypes.REGISTERED ) {
			return (
				<Accordion
					title={ translate( 'Details', { textOnly: true } ) }
					subtitle={ translate( 'Registration and auto-renew', { textOnly: true } ) }
					key="main"
					expanded
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
		}
	};

	const renderSetAsPrimaryDomainSection = () => {
		return <SetAsPrimary domain={ domain } selectedSite={ selectedSite } key="set-as-primary" />;
	};

	const renderDomainSecuritySection = () => {
		return renderSecurityAccordion();
	};

	const getContactInformationAccordion = () => {
		const placeholderAccordion = (
			<Accordion
				title="Contact information"
				subtitle="Contact information"
				isPlaceholder
			></Accordion>
		);

		if ( ! domain || ! domains ) return placeholderAccordion;

		if (
			domain.type !== domainTypes.REGISTERED ||
			( ! isDomainUpdateable( domain ) && ! isDomainInGracePeriod( domain ) )
		) {
			return null;
		}

		const { privateDomain } = domain;
		const contactInformation = findRegistrantWhois( whoisData );

		if ( ! contactInformation ) {
			requestWhois( selectedDomainName );
			return placeholderAccordion;
		}

		const contactInfoFullName = `${ contactInformation.fname } ${ contactInformation.lname }`;
		const privacyProtectionLabel = privateDomain
			? translate( 'privacy protection on' )
			: translate( 'privacy protection off' );

		return (
			<Accordion
				title="Contact information"
				subtitle={ `${ contactInfoFullName }, ${ privacyProtectionLabel }` }
			>
				<ContactsPrivacyInfo
					domains={ domains }
					selectedSite={ selectedSite }
					selectedDomainName={ selectedDomainName }
				></ContactsPrivacyInfo>
			</Accordion>
		);
	};

	const renderMainContent = () => {
		// TODO: If it's a registered domain or transfer and the domain's registrar is in maintenance, show maintenance card
		return (
			<>
				{ renderDetailsSection() }
				{ renderSetAsPrimaryDomainSection() }
				{ getContactInformationAccordion() }
				{ renderDomainSecuritySection() }
			</>
		);
	};

	const renderSettingsCards = () => (
		<>
			<DomainEmailInfoCard selectedSite={ selectedSite } domain={ domain } />
			<DomainTransferInfoCard selectedSite={ selectedSite } domain={ domain } />
			<DomainDeleteInfoCard selectedSite={ selectedSite } domain={ domain } />
		</>
	);

	if ( ! domain ) {
		// TODO: Update this placeholder
		return <DomainMainPlaceholder breadcrumbs={ renderBreadcrumbs } />;
	}

	return (
		<Main wideLayout className="settings">
			{ selectedSite.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderBreadcrumbs() }
			<SettingsHeader domain={ domain } />
			<TwoColumnsLayout content={ renderMainContent() } sidebar={ renderSettingsCards() } />
		</Main>
	);
};

export default connect(
	( state, ownProps: SettingsPageProps ): SettingsPageConnectedProps => {
		const domain = ownProps.domains && getSelectedDomain( ownProps );
		const subscriptionId = domain && domain.subscriptionId;
		const currentUserId = getCurrentUserId( state );
		const purchase = subscriptionId
			? getByPurchaseId( state, parseInt( subscriptionId, 10 ) )
			: null;

		return {
			whoisData: getWhoisData( state, ownProps.selectedDomainName ),
			currentRoute: getCurrentRoute( state ),
			domain: getSelectedDomain( ownProps )!,
			isLoadingPurchase:
				isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
			purchase: purchase && purchase.userId === currentUserId ? purchase : null,
		};
	},
	{
		requestWhois,
	}
)( Settings );
