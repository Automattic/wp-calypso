import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentType } from 'react';
import { type as domainTypes, transferStatus } from '../utils/constants';
import { domainMagementDNS, domainManagementLink } from '../utils/paths';
import { ResponseDomain } from '../utils/types';

interface MenuItemLinkProps extends Omit< React.ComponentProps< typeof MenuItem >, 'href' > {
	href?: string;
}

const MenuItemLink = MenuItem as ComponentType< MenuItemLinkProps >;

interface DomainsTableRowActionsProps {
	siteSlug: string;
	domain: ResponseDomain;
	isAllSitesView: boolean;
}

export const DomainsTableRowActions = ( {
	domain,
	siteSlug,
	isAllSitesView,
}: DomainsTableRowActionsProps ) => {
	const { __ } = useI18n();

	const canConnectDomainToASite = domain.currentUserCanCreateSiteFromDomainOnly;
	const canManageDNS =
		domain.canManageDnsRecords &&
		domain.transferStatus !== transferStatus.PENDING_ASYNC &&
		domain.type !== domainTypes.SITE_REDIRECT;

	return (
		<DropdownMenu
			className="domains-table-row__actions"
			icon={ <Gridicon icon="ellipsis" /> }
			label={ __( 'Domain actions' ) }
		>
			{ () => (
				<MenuGroup>
					<MenuItemLink href={ domainManagementLink( domain, siteSlug, isAllSitesView ) }>
						{ domain.type === domainTypes.TRANSFER ? __( 'View transfer' ) : __( 'View settings' ) }
					</MenuItemLink>
					{ canManageDNS && (
						<MenuItemLink href={ domainMagementDNS( siteSlug, domain.name ) }>
							{ __( 'Manage DNS' ) }
						</MenuItemLink>
					) }
					{ canConnectDomainToASite && (
						<MenuItemLink
							href={ domainManagementTransferToOtherSiteLink( siteSlug, domain.domain ) }
						>
							{ __( 'Connect to an existing site' ) }
						</MenuItemLink>
					) }
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

export function domainManagementTransferToOtherSiteLink( siteSlug: string, domainName: string ) {
	return `/domains/manage/all/${ domainName }/transfer/other-site/${ siteSlug }`;
}
