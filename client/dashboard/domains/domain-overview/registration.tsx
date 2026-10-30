import { DomainSubtype, type Domain } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import DomainContactDetailsSettingsSummary from '../domain-contact-details/summary';
import DomainRenewalSettingsSummary from './renewal-summary';

export default function DomainOverviewRegistration( {
	domain,
	isDisabled,
}: {
	domain: Domain;
	isDisabled?: boolean;
} ) {
	if ( domain.subtype.id !== DomainSubtype.DOMAIN_REGISTRATION ) {
		return null;
	}

	// `current_user_can_manage` is always false in a support session. The link is still shown so
	// that support can copy its URL for the user; the route itself blocks editing in that case.
	const showContactDetails =
		( domain.current_user_can_manage || isSupportSession() ) &&
		! domain.pending_transfer &&
		! domain.expired;

	if ( ! domain.subscription_id && ! showContactDetails ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Registration' ) } level={ 3 } />
			<SummaryButtonList>
				{ domain.subscription_id ? (
					<DomainRenewalSettingsSummary domain={ domain } purchaseId={ domain.subscription_id } />
				) : null }
				{ showContactDetails ? (
					<DomainContactDetailsSettingsSummary domain={ domain } isDisabled={ isDisabled } />
				) : null }
			</SummaryButtonList>
		</VStack>
	);
}
