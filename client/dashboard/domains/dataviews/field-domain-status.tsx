import { DomainStatusCta } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	domainOverviewRoute,
	domainConnectionSetupRoute,
	domainTransferSetupRoute,
} from '../../app/router/domains';
import { Text } from '../../components/text';
import { getPurchaseUrlForId } from '../../me/billing-purchases/urls';
import type { DomainSummary } from '@automattic/api-core';

const getCtaLink = ( domain: DomainSummary ) => {
	switch ( domain.domain_status?.cta ) {
		case DomainStatusCta.VIEW_DOMAIN:
			return (
				<Link to={ domainOverviewRoute.fullPath } params={ { domainName: domain.domain } }>
					{ __( 'Needs attention' ) }
				</Link>
			);
		case DomainStatusCta.VIEW_PURCHASE:
			if ( domain.subscription_id === null ) {
				return null;
			}
			return (
				<Link to={ getPurchaseUrlForId( domain.subscription_id ) }>
					{ __( 'Needs attention' ) }
				</Link>
			);
		case DomainStatusCta.VIEW_DOMAIN_SETUP:
			return (
				<Link to={ domainConnectionSetupRoute.fullPath } params={ { domainName: domain.domain } }>
					{ __( 'Setup connection' ) }
				</Link>
			);
		case DomainStatusCta.VIEW_TRANSFER_SETUP:
			return (
				<Link to={ domainTransferSetupRoute.fullPath } params={ { domainName: domain.domain } }>
					{ __( 'Setup transfer' ) }
				</Link>
			);
		default:
			return null;
	}
};

export const DomainStatusField = ( {
	domain,
	value,
}: {
	domain: DomainSummary;
	value: string;
} ) => {
	return (
		<VStack spacing={ 1 }>
			<Text intent={ domain.domain_status.type }>{ value }</Text>
			{ domain.domain_status?.cta && getCtaLink( domain ) }
		</VStack>
	);
};
