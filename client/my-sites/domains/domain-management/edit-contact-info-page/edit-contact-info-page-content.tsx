import { getSelectedDomain } from 'calypso/lib/domains';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import {
	domainManagementAllOverview,
	domainManagementEdit,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import EditContactInfoFormCard from '../edit-contact-info/form-card';
import PendingWhoisUpdateCard from '../edit-contact-info/pending-whois-update-card';
import EditContactInfoPrivacyEnabledCard from '../edit-contact-info/privacy-enabled-card';
import { EditContactInfoPageContentProps } from './types';

const EditContactInfoPageContent = ( {
	currentRoute,
	domains,
	selectedDomainName,
	selectedSite,
}: EditContactInfoPageContentProps ) => {
	const domain = getSelectedDomain( { domains, selectedDomainName } );
	if ( ! domain ) {
		return;
	}

	if ( ! domain.currentUserCanManage ) {
		return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
	}

	if ( ! domain.canUpdateContactInfo ) {
		return <InfoNotice redesigned={ false } text={ domain.cannotUpdateContactInfoReason } />;
	}

	if ( domain.isPendingWhoisUpdate ) {
		return <PendingWhoisUpdateCard />;
	}

	if ( domain.mustRemovePrivacyBeforeContactUpdate && domain.privateDomain && selectedSite ) {
		return (
			<EditContactInfoPrivacyEnabledCard
				selectedDomainName={ selectedDomainName }
				selectedSiteSlug={ selectedSite?.slug }
			/>
		);
	}

	const backUrl = isUnderDomainManagementAll( currentRoute )
		? domainManagementAllOverview( selectedSite?.slug ?? '', selectedDomainName )
		: domainManagementEdit( selectedSite?.slug ?? '', selectedDomainName, currentRoute );

	return (
		<EditContactInfoFormCard
			domainRegistrationAgreementUrl={ domain.domainRegistrationAgreementUrl }
			selectedDomain={ domain }
			selectedSite={ selectedSite }
			showContactInfoNote={ false }
			backUrl={ backUrl }
		/>
	);
};

export default EditContactInfoPageContent;
