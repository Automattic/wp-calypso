import { Card } from '@automattic/components';
import { ReactElement, useCallback } from 'react';
import { getSelectedDomain } from 'calypso/lib/domains';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import EditContactInfoFormCard from '../edit-contact-info/form-card';
import PendingWhoisUpdateCard from '../edit-contact-info/pending-whois-update-card';
import EditContactInfoPrivacyEnabledCard from '../edit-contact-info/privacy-enabled-card';
import { EditContactInfoPageContentProps } from './types';

const EditContactInfoPageContent = ( {
	currentRoute,
	domains,
	selectedDomainName,
	selectedSite,
	isCard,
}: EditContactInfoPageContentProps ) => {
	const maybeShowAsCard = useCallback(
		( content: ReactElement ) => {
			return isCard ? <Card>{ content }</Card> : content;
		},
		[ isCard ]
	);

	const domain = getSelectedDomain( { domains, selectedDomainName } );
	if ( ! domain ) {
		return;
	}

	if ( ! domain.currentUserCanManage ) {
		return maybeShowAsCard(
			<NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />
		);
	}

	if ( ! domain.canUpdateContactInfo ) {
		return maybeShowAsCard(
			<InfoNotice redesigned={ false } text={ domain.cannotUpdateContactInfoReason } />
		);
	}

	if ( domain.isPendingWhoisUpdate ) {
		return maybeShowAsCard( <PendingWhoisUpdateCard /> );
	}

	if ( domain.mustRemovePrivacyBeforeContactUpdate && domain.privateDomain && selectedSite ) {
		return maybeShowAsCard(
			<EditContactInfoPrivacyEnabledCard
				selectedDomainName={ selectedDomainName }
				selectedSiteSlug={ selectedSite?.slug }
			/>
		);
	}

	const backUrl = domainManagementEdit(
		selectedSite?.slug ?? '',
		selectedDomainName,
		currentRoute
	);

	return maybeShowAsCard(
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
