import config from '@automattic/calypso-config';
import { memo } from 'react';
import { connect } from 'react-redux';
import { getSelectedDomain } from 'calypso/lib/domains';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import ContactsPrivacyCard from './contacts-card';
import type { ContactsInfoPassedProps, ContactsInfoProps } from './types';
import './style.scss';

const ContactsPrivacy = ( props: ContactsInfoProps ): null | JSX.Element => {
	const renderForOwner = () => {
		const domain = getSelectedDomain( props );
		if ( ! domain ) {
			return null;
		}
		const {
			privateDomain,
			privacyAvailable,
			contactInfoDisclosed,
			contactInfoDisclosureAvailable,
			isPendingIcannVerification,
		} = domain;

		const canManageConsent =
			config.isEnabled( 'domains/gdpr-consent-page' ) && domain.supportsGdprConsentManagement;

		return (
			<ContactsPrivacyCard
				selectedDomainName={ props.selectedDomainName }
				selectedSite={ props.selectedSite }
				canManageConsent={ canManageConsent }
				privateDomain={ privateDomain }
				privacyAvailable={ privacyAvailable }
				contactInfoDisclosed={ contactInfoDisclosed }
				contactInfoDisclosureAvailable={ contactInfoDisclosureAvailable }
				isPendingIcannVerification={ isPendingIcannVerification }
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
	return domain?.currentUserCanManage ? renderForOwner() : renderForOthers();
};

export default connect( ( state, ownProps: ContactsInfoPassedProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( memo( ContactsPrivacy ) );
