import { DomainSubtype, type Domain } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import DomainContactDetailsSettingsSummary from '../domain-contact-details/summary';
import DomainRenewalSettingsSummary from './renewal-summary';
import { useTrackOverviewItem } from './use-track-overview-item';

export default function DomainOverviewRegistration( {
	domain,
	isDisabled,
}: {
	domain: Domain;
	isDisabled?: boolean;
} ) {
	const trackItem = useTrackOverviewItem( domain );

	const purchaseId = domain.subscription_id;
	const renewalDate =
		domain.auto_renewing && ! domain.expired ? domain.auto_renewal_date : domain.expiry;
	const showRenewal =
		domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION && !! purchaseId && !! renewalDate;

	// `current_user_can_manage` is always false in a support session. The link is still shown so
	// that support can copy its URL for the user; the route itself blocks editing in that case.
	const showContactDetails =
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		( domain.current_user_can_manage || isSupportSession() ) &&
		! domain.pending_transfer &&
		! domain.expired;

	if ( ! showRenewal && ! showContactDetails ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Registration' ) } level={ 3 } />
			<SummaryButtonList>
				{ showRenewal ? (
					<DomainRenewalSettingsSummary
						domain={ domain }
						purchaseId={ purchaseId }
						date={ renewalDate }
						onClick={ () => trackItem( 'renew' ) }
					/>
				) : null }
				{ showContactDetails ? (
					<DomainContactDetailsSettingsSummary
						domain={ domain }
						isDisabled={ isDisabled }
						onClick={ () => trackItem( 'contact-details' ) }
					/>
				) : null }
			</SummaryButtonList>
		</VStack>
	);
}
