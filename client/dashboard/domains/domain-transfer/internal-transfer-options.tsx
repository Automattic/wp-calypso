import { DomainSubtype } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { domainTransferToOtherSiteRoute } from '../../app/router/domains';
import { ActionList } from '../../components/action-list';
import RouterLinkButton from '../../components/router-link-button';
import { getTopLevelOfTld } from '../../utils/domain';
import type { Domain } from '@automattic/api-core';

/**
 * TLDs that have restricted transfer capabilities
 */
const RESTRICTED_TRANSFER_TLDS = [ 'uk', 'fr', 'ca', 'de', 'jp' ] as const;

/**
 * Transfer action configuration type
 */
interface TransferAction {
	key: string;
	title: string;
	description: string;
	route: string;
	routeParams?: Record< string, string >;
}

interface InternalTransferOptionsProps {
	domain: Domain;
}

/**
 * Checks if a domain's TLD is restricted for transfers
 */
function isDomainTransferRestricted( domain: Domain ): boolean {
	const tld = getTopLevelOfTld( domain.domain );
	return ( RESTRICTED_TRANSFER_TLDS as readonly string[] ).includes( tld );
}

/**
 * Gets the appropriate description text based on domain type
 */
function getTransferDescription(
	domain: Domain,
	transferType: 'user' | 'site' | 'any-user'
): string {
	const isDomainConnection = domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION;

	if ( isDomainConnection ) {
		switch ( transferType ) {
			case 'user':
				return __( 'Transfer this domain connection to any administrator on this site.' );
			case 'site':
				return __( 'Transfer this domain connection to any site you are an administrator on.' );
			case 'any-user':
				return __( 'Transfer this domain connection to another WordPress.com user' );
			default:
				return '';
		}
	}

	switch ( transferType ) {
		case 'user':
			return __( 'Transfer this domain to any administrator on this site.' );
		case 'site':
			return __( 'Transfer this domain to any site you are an administrator on.' );
		case 'any-user':
			return __( 'Transfer this domain to another WordPress.com user' );
		default:
			return '';
	}
}

/**
 * Creates transfer action configurations based on domain capabilities
 */
function createTransferActions( domain: Domain ): TransferAction[] {
	const actions: TransferAction[] = [];
	const isRestricted = isDomainTransferRestricted( domain );

	// Transfer to another user on the same site
	if ( ! domain.is_domain_only_site && domain.can_transfer_to_any_user && ! isRestricted ) {
		actions.push( {
			key: 'transfer-to-another-user',
			title: __( 'Transfer to another user' ),
			description: getTransferDescription( domain, 'user' ),
			route: `/domains/${ domain.domain }/transfer/other-user`,
		} );
	}

	// Transfer to any WordPress.com user (domain-only sites)
	if ( domain.is_domain_only_site && domain.can_transfer_to_any_user && ! isRestricted ) {
		actions.push( {
			key: 'transfer-to-any-user',
			title: __( 'To another WordPress.com user' ),
			description: getTransferDescription( domain, 'any-user' ),
			route: `/domains/${ domain.domain }/transfer/any-user`,
		} );
	}

	// Transfer to another site
	if ( domain.can_transfer_to_other_site ) {
		actions.push( {
			key: 'transfer-to-another-site',
			title: __( 'To another WordPress.com site' ),
			description: getTransferDescription( domain, 'site' ),
			route: domainTransferToOtherSiteRoute.fullPath,
			routeParams: { domainName: domain.domain },
		} );
	}

	return actions;
}

/**
 * Creates an ActionList.ActionItem component from transfer action configuration
 */
function createActionItem( action: TransferAction ) {
	return (
		<ActionList.ActionItem
			key={ action.key }
			title={ action.title }
			description={ action.description }
			actions={
				<RouterLinkButton
					variant="secondary"
					size="compact"
					to={ action.route }
					params={ action.routeParams }
				>
					{ __( 'Continue' ) }
				</RouterLinkButton>
			}
		/>
	);
}

/**
 * InternalTransferOptions component renders transfer options available for a domain
 * @param props - Component props
 * @param props.domain - The domain object containing transfer capabilities
 * @returns JSX element with transfer options or null if no options available
 */
export default function InternalTransferOptions( { domain }: InternalTransferOptionsProps ) {
	const transferActions = useMemo( () => createTransferActions( domain ), [ domain ] );

	if ( transferActions.length === 0 ) {
		return null;
	}

	return <ActionList>{ transferActions.map( createActionItem ) }</ActionList>;
}
