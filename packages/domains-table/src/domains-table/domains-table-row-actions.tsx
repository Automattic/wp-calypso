import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentType } from 'react';
import { canSetAsPrimary } from '../utils/can-set-as-primary';
import { type as domainTypes, transferStatus, useMyDomainInputMode } from '../utils/constants';
import { isFreeUrlDomainName } from '../utils/is-free-url-domain-name';
import { isDomainInGracePeriod } from '../utils/is-in-grace-period';
import { isRecentlyRegistered } from '../utils/is-recently-registered';
import { isDomainRenewable } from '../utils/is-renewable';
import { isDomainUpdateable } from '../utils/is-updateable';
import {
	domainMagementDNS,
	domainManagementEditContactInfo,
	domainManagementLink,
	domainManagementTransferToOtherSiteLink,
	domainUseMyDomain,
} from '../utils/paths';
import { shouldUpgradeToMakeDomainPrimary } from '../utils/should-upgrade-to-make-domain-primary';
import { ResponseDomain } from '../utils/types';
import { useDomainsTable } from './domains-table';
import { isDomainReactivatable } from '../utils/is-reactivatable';
import { useDispatch } from 'calypso/state';
import { handleRenewNowClick } from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';

export type DomainAction = 'change-site-address' | 'manage-dns-settings' | 'set-primary-address' | 'renew-domain' | 'reactivate-doamin';

interface MenuItemLinkProps extends Omit< React.ComponentProps< typeof MenuItem >, 'href' > {
	href?: string;
}

const MenuItemLink = MenuItem as ComponentType< MenuItemLinkProps >;

interface DomainsTableRowActionsProps {
	siteSlug: string;
	domain: ResponseDomain;
	isAllSitesView: boolean;
	canSetPrimaryDomainForSite: boolean;
	isSiteOnFreePlan: boolean;
	isSimpleSite: boolean;
	purchase: Purchase | null;
}

export const DomainsTableRowActions = ( {
	domain,
	siteSlug,
	isAllSitesView,
	canSetPrimaryDomainForSite,
	isSiteOnFreePlan,
	isSimpleSite,
	purchase,
}: DomainsTableRowActionsProps ) => {
	const { onDomainAction, userCanSetPrimaryDomains = false, updatingDomain, handleManualRenew } = useDomainsTable();
	const { __ } = useI18n();

	const canViewDetails = domain.type !== domainTypes.WPCOM;
	const canConnectDomainToASite = isAllSitesView && domain.currentUserCanCreateSiteFromDomainOnly;
	const canManageDNS =
		domain.canManageDnsRecords &&
		domain.transferStatus !== transferStatus.PENDING_ASYNC &&
		domain.type !== domainTypes.SITE_REDIRECT;
	const canManageContactInfo =
		domain.type === domainTypes.REGISTERED &&
		( isDomainUpdateable( domain ) || isDomainInGracePeriod( domain ) );
	const canMakePrimarySiteAddress =
		! isAllSitesView &&
		canSetAsPrimary(
			domain,
			shouldUpgradeToMakeDomainPrimary( domain, {
				isDomainOnly: domain.currentUserCanCreateSiteFromDomainOnly,
				canSetPrimaryDomainForSite,
				userCanSetPrimaryDomains,
				isSiteOnFreePlan,
			} )
		) &&
		! isRecentlyRegistered( domain.registrationDate );
	const canTransferToWPCOM =
		domain.type === domainTypes.MAPPED && domain.isEligibleForInboundTransfer;
	const canChangeSiteAddress =
		! isAllSitesView && isSimpleSite && isFreeUrlDomainName( domain.name );
	const canRenewDomain = isDomainRenewable( domain );
	const canReactivateDomain = isDomainReactivatable( domain );
	const getActions = ( onClose?: () => void ) => {
		return [
			canViewDetails && (
				<MenuItemLink
					key="actionDetails"
					href={ domainManagementLink( domain, siteSlug, isAllSitesView ) }
				>
					{ domain.type === domainTypes.TRANSFER ? __( 'View transfer' ) : __( 'View settings' ) }
				</MenuItemLink>
			),
			canManageDNS && (
				<MenuItemLink
					key="manageDNS"
					onClick={ () => onDomainAction?.( 'manage-dns-settings', domain ) }
					href={ domainMagementDNS( siteSlug, domain.name ) }
				>
					{ __( 'Manage DNS' ) }
				</MenuItemLink>
			),
			canManageContactInfo && (
				<MenuItemLink
					key="manageContactInfo"
					href={ domainManagementEditContactInfo( siteSlug, domain.name ) }
				>
					{ __( 'Manage contact information' ) }
				</MenuItemLink>
			),
			canMakePrimarySiteAddress && (
				<MenuItemLink
					key="makePrimarySiteAddress"
					onClick={ () => {
						onDomainAction?.( 'set-primary-address', domain );
						onClose?.();
					} }
					disabled={ updatingDomain?.action === 'set-primary-address' }
				>
					{ __( 'Make primary site address' ) }
				</MenuItemLink>
			),
			canTransferToWPCOM && (
				<MenuItemLink
					key="transferToWPCOM"
					href={ domainUseMyDomain( siteSlug, domain.name, useMyDomainInputMode.transferDomain ) }
				>
					{ __( 'Transfer to WordPress.com' ) }
				</MenuItemLink>
			),
			canConnectDomainToASite && (
				<MenuItemLink
					key="connectToSite"
					href={ domainManagementTransferToOtherSiteLink( siteSlug, domain.domain ) }
				>
					{ __( 'Attach to an existing site' ) }
				</MenuItemLink>
			),
			canChangeSiteAddress && (
				<MenuItemLink
					key="changeSiteAddress"
					onClick={ () => {
						onDomainAction?.( 'change-site-address', domain );
						onClose?.();
					} }
				>
					{ __( 'Change site address' ) }
				</MenuItemLink>
			),
			canRenewDomain && (
				<MenuItemLink
					key="renewDomain"
					onClick={ () => {
						handleManualRenew( domain );
						onClose?.();
					} }
				>
					{ ! domain.expired || domain.isRenewable
						? __( 'Renew now' )
						: __( 'Redeem now' ) }
				</MenuItemLink>
			),
			canReactivateDomain && (
				<MenuItemLink
					key="reactivateDomain"
					onClick={ () => {
						handleManualRenew( domain );
						onClose?.();
					} }
				>
					{ __( 'Reactivate domain' ) }
				</MenuItemLink>
			),
		];
	};

	if ( getActions().filter( Boolean ).length === 0 ) {
		return null;
	}

	return (
		<DropdownMenu
			className="domains-table-row__actions"
			icon={ <Gridicon icon="ellipsis" /> }
			label={ __( 'Domain actions' ) }
		>
			{ ( { onClose } ) => (
				<MenuGroup className="domains-table-row__actions-group">
					{ getActions( onClose ) }
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};
