import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain } from 'calypso/lib/domains';
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
			<div>
				<EditContactInfoFormCard
					domainRegistrationAgreementUrl={ domain.domainRegistrationAgreementUrl }
					selectedDomain={ domain }
					selectedSite={ selectedSite }
					showContactInfoNote={ true }
				/>
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
			<TwoColumnsLayout content={ renderContent() } sidebar={ <div>SIDEBAR HERE</div> } />
		</Main>
	);
};

export default connect( ( state, ownProps: EditContactInfoPageProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( EditContactInfoPage );
