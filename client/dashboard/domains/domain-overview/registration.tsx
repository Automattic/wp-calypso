import { DomainSubtype, type Domain, type Purchase } from '@automattic/api-core';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonList } from '../../components/summary-button-list';
import DomainContactDetailsSettingsSummary from '../domain-contact-details/summary';
import DomainRenewalSettingsSummary, { getRenewalDate } from './renewal-summary';
import { useTrackOverviewItem } from './use-track-overview-item';

import './style.scss';

export default function DomainOverviewRegistration( {
	domain,
	purchase,
	isDisabled,
}: {
	domain: Domain;
	purchase?: Purchase;
	isDisabled?: boolean;
} ) {
	const trackItem = useTrackOverviewItem( domain );

	const purchaseId = domain.subscription_id;
	const showRenewal = !! purchaseId && !! getRenewalDate( domain );

	if ( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader
				title={ __( 'Registration' ) }
				level={ 3 }
				className="domain-overview-section-header"
			/>
			<SummaryButtonList>
				{ showRenewal ? (
					<DomainRenewalSettingsSummary
						domain={ domain }
						purchase={ purchase }
						purchaseId={ purchaseId }
						onClick={ () => trackItem( 'renew' ) }
					/>
				) : null }
				<DomainContactDetailsSettingsSummary
					domain={ domain }
					isDisabled={ isDisabled }
					onClick={ () => trackItem( 'contact-details' ) }
				/>
			</SummaryButtonList>
		</VStack>
	);
}
