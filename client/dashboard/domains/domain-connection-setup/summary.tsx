import {
	DomainConnectionSetupMode,
	type Domain,
	type DomainMappingStatus,
} from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { domainConnectionSetupRoute } from '../../app/router/domains';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isMappingVerificationSuccess } from './utils';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function DomainConnectionSetupSummary( {
	domain,
	domainMappingStatus,
}: {
	domain: Domain;
	domainMappingStatus?: DomainMappingStatus;
} ) {
	const badges: SummaryButtonBadgeProps[] = [];
	const isConnected =
		domainMappingStatus &&
		isMappingVerificationSuccess( domainMappingStatus.mode ?? null, domainMappingStatus );

	if ( isConnected ) {
		badges.push( { text: __( 'Connected' ), intent: 'success' } );
	} else if ( domainMappingStatus?.mode === DomainConnectionSetupMode.ADVANCED ) {
		badges.push( { text: __( 'Verifying DNS' ), intent: 'warning' } );
	} else if ( domainMappingStatus?.mode === DomainConnectionSetupMode.SUGGESTED ) {
		badges.push( { text: __( 'Verifying name servers' ), intent: 'warning' } );
	}

	return (
		<RouterLinkSummaryButton
			to={ domainConnectionSetupRoute.fullPath }
			params={ { domainName: domain.domain } }
			title={ __( 'Domain connection setup' ) }
			density={ 'medium' as const }
			badges={ badges }
		/>
	);
}
