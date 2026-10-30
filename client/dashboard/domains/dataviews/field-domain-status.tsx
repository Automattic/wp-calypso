import { DomainStatusCta } from '@automattic/api-core';
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
import { useIsDomainActivating } from './use-domain-activation';
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

	const activationTime = __( 'Can take up to 15 minutes' );

	return (
		<VStack spacing={ 1 }>
			<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
				<Text
					intent={ isActivating ? undefined : domain.domain_status.type }
					variant={ isActivating ? 'muted' : undefined }
				>
					{ isActivating ? __( 'Activating' ) : value }
				</Text>
				{ isActivating && (
					<Tooltip text={ activationTime }>
						<Text
							variant="muted"
							role="img"
							aria-label={ activationTime }
							tabIndex={ 0 }
							style={ { display: 'flex' } }
						>
							<Icon icon={ info } style={ { fill: 'currentColor' } } />
						</Text>
					</Tooltip>
				) }
			</HStack>
			{ ! isActivating && domain.domain_status?.cta && getCtaLink( domain ) }
		</VStack>
	);
};
