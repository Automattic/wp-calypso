import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentType } from 'react';
import { type as domainTypes } from '../utils/constants';
import { domainManagementLink } from '../utils/paths';
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
