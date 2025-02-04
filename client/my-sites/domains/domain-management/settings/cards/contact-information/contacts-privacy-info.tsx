import { memo } from 'react';
import { connect } from 'react-redux';
import { getSelectedDomain } from 'calypso/lib/domains';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import { IAppState } from 'calypso/state/types';
import ContactsPrivacyCard from './contacts-card';
import type { ContactsInfoPassedProps, ContactsInfoProps } from './types';
import './style.scss';

const ContactsPrivacy = ( props: ContactsInfoProps ): null | JSX.Element => {
	const renderForOwner = ( readonly = false ) => {
		const domain = getSelectedDomain( props );
		if ( ! domain ) {
			return null;
		}
		const {
			privateDomain,
			privacyAvailable,
			contactInfoDisclosed,
			contactInfoDisclosureAvailable,
			hasPendingContactUpdate,
			isPendingIcannVerification,
			registeredViaTrustee,
			registeredViaTrusteeUrl,
			supportsGdprConsentManagement,
			isHundredYearDomain,
		} = domain;

		return (
			<ContactsPrivacyCard
				selectedDomainName={ props.selectedDomainName }
				selectedSite={ props.selectedSite }
				canManageConsent={ supportsGdprConsentManagement }
				privateDomain={ privateDomain }
				privacyAvailable={ privacyAvailable }
				contactInfoDisclosed={ contactInfoDisclosed }
				contactInfoDisclosureAvailable={ contactInfoDisclosureAvailable }
				hasPendingContactUpdate={ hasPendingContactUpdate }
				isPendingIcannVerification={ isPendingIcannVerification }
				readOnly={ readonly }
				registeredViaTrustee={ registeredViaTrustee }
				registeredViaTrusteeUrl={ registeredViaTrusteeUrl }
				isHundredYearDomain={ isHundredYearDomain }
			/>
		);
	};

	const renderForOthers = () => {
		const { domains, selectedDomainName } = props;
		return (
			<NonOwnerCard redesigned domains={ domains } selectedDomainName={ selectedDomainName } />
		);
	};

	const domain = getSelectedDomain( props );
	if ( domain && ! domain.canUpdateContactInfo ) {
		return (
			<>
				<InfoNotice redesigned text={ domain.cannotUpdateContactInfoReason } />
				<br />
				{ renderForOwner( true ) }
			</>
		);
	}
	return domain?.currentUserCanManage ? renderForOwner() : renderForOthers();
};

export default connect( ( state: IAppState, ownProps: ContactsInfoPassedProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( memo( ContactsPrivacy ) );
