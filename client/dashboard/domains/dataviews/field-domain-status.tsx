import { DomainStatus, DomainStatusCta } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import {
	Tooltip,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import {
	domainOverviewRoute,
	domainConnectionSetupRoute,
	domainTransferSetupRoute,
} from '../../app/router/domains';
import { purchaseSettingsRoute } from '../../app/router/me';
import { Text } from '../../components/text';
import { useDomainSslDetails, useIsDomainActivating } from './use-domain-activation';
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
				<Link
					to={ purchaseSettingsRoute.fullPath }
					params={ { purchaseId: domain.subscription_id } }
				>
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
	const isActivating = useIsDomainActivating( domain );
	const { data: sslDetails } = useDomainSslDetails( domain );

	// The backend labels every registration "Activating" for its first 30 minutes,
	// even once the domain works.
	const label =
		domain.domain_status.id === DomainStatus.ACTIVE && sslDetails?.certificate_provisioned
			? __( 'Active' )
			: value;

	const activationTime = __( 'Can take up to 15 minutes' );

	return (
		<VStack spacing={ 0 }>
			<Tooltip text={ isActivating ? activationTime : undefined }>
				<HStack
					spacing={ 1 }
					justify="flex-start"
					expanded={ false }
					style={ isActivating ? { cursor: 'pointer' } : undefined }
				>
					<Text
						intent={ isActivating ? undefined : domain.domain_status.type }
						variant={ isActivating ? 'muted' : undefined }
					>
						{ isActivating ? __( 'Activating' ) : label }
					</Text>
					{ isActivating && (
						<Text
							variant="muted"
							role="img"
							aria-label={ activationTime }
							tabIndex={ 0 }
							style={ { display: 'flex' } }
						>
							<Icon icon={ info } />
						</Text>
					) }
				</HStack>
			</Tooltip>
			{ ! isActivating && domain.domain_status?.cta && getCtaLink( domain ) }
		</VStack>
	);
};
