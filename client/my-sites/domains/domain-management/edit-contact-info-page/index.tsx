import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain } from 'calypso/lib/domains';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementContactsPrivacy,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import EditContactInfoFormCard from '../edit-contact-info/form-card';
import PendingWhoisUpdateCard from '../edit-contact-info/pending-whois-update-card';
import EditContactInfoPrivacyEnabledCard from '../edit-contact-info/privacy-enabled-card';
import { EditContactInfoPageProps } from './types';

import './style.scss';

const EditContactInfoPage = ( {
	currentRoute,
	domains,
	isRequestingWhois,
	selectedDomainName,
	selectedSite,
}: EditContactInfoPageProps ): JSX.Element => {
	const translate = useTranslate();

	const isDataLoading = () => {
		return ! getSelectedDomain( { domains, selectedDomainName } ) || isRequestingWhois;
	};

	const goToContactsPrivacy = () => {
		page( domainManagementContactsPrivacy( selectedSite?.slug, selectedDomainName, currentRoute ) );
	};

	const renderBreadcrumbs = () => {
		const previousPath = domainManagementEdit(
			selectedSite?.slug,
			selectedDomainName,
			currentRoute
		);

		const items = [
			{
				label: translate( 'Domains' ),
				href: domainManagementList( selectedSite?.slug, currentRoute ),
			},
			{
				label: selectedDomainName,
				href: previousPath,
			},
			{ label: translate( 'Edit contact infomation' ) },
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	const renderContent = () => {
		const domain = getSelectedDomain( { domains, selectedDomainName } );

		if ( ! domain.currentUserCanManage ) {
			return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
		}

		if ( domain.isPendingWhoisUpdate ) {
			return <PendingWhoisUpdateCard />;
		}

		if ( domain.mustRemovePrivacyBeforeContactUpdate && domain.privateDomain ) {
			return (
				<EditContactInfoPrivacyEnabledCard
					selectedDomainName={ selectedDomainName }
					selectedSiteSlug={ selectedSite?.slug as string }
				/>
			);
		}

		return (
			<EditContactInfoFormCard
				domainRegistrationAgreementUrl={ domain.domainRegistrationAgreementUrl }
				selectedDomain={ domain }
				selectedSite={ selectedSite }
				showContactInfoNote={ false }
			/>
		);
	};

	const renderSidebar = () => {
		const supportLink = (
			<ExternalLink
				href={ localizeUrl(
					'https://wordpress.com/support/domains/domain-registrations-and-privacy/#privacy-protection'
				) }
				target="_blank"
				icon={ false }
			/>
		);
		const icannLink = (
			<ExternalLink
				href="https://www.icann.org/resources/pages/contact-verification-2013-05-03-en"
				target="_blank"
				icon={ false }
			/>
		);
		const explanationText1 = translate(
			'{{icannLinkComponent}}ICANN{{/icannLinkComponent}} requires accurate contact information for registrants. This information will be validated after purchase. Failure to validate your contact information will result in domain suspension.',
			{
				components: {
					icannLinkComponent: icannLink,
				},
			}
		);
		const explanationText2 = translate(
			'Domain privacy service is included for free on applicable domains. {{supportLinkComponent}}Learn more{{/supportLinkComponent}}.',
			{
				components: {
					supportLinkComponent: supportLink,
				},
			}
		);
		return (
			<div className="edit-contact-info-page__sidebar">
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="edit-contact-info-page__sidebar__title">
					<p>
						<strong>{ translate( 'Provide accurate contact information' ) }</strong>
					</p>
				</div>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<div className="edit-contact-info-page__sidebar__content">
					<p>{ explanationText1 }</p>
					<p>{ explanationText2 }</p>
				</div>
			</div>
		);
	};

	if ( isDataLoading() ) {
		return <DomainMainPlaceholder goBack={ goToContactsPrivacy } />;
	}

	return (
		<Main className="edit-contact-info-page" wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderBreadcrumbs() }
			<FormattedHeader
				brandFont
				headerText={ translate( 'Edit contact information' ) }
				subHeaderText={ translate(
					'Domain owners are required to provide correct contact information'
				) }
				align="left"
			/>
			<TwoColumnsLayout content={ renderContent() } sidebar={ renderSidebar() } />
		</Main>
	);
};

export default connect( ( state, ownProps: EditContactInfoPageProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( EditContactInfoPage );
