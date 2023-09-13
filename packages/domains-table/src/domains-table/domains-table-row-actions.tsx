import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentType } from 'react';

interface MenuItemLinkProps extends Omit< React.ComponentProps< typeof MenuItem >, 'href' > {
	href?: string;
}

const MenuItemLink = MenuItem as ComponentType< MenuItemLinkProps >;

interface DomainsTableRowActionsProps {
	canConnectDomainToASite: boolean;
	siteSlug: string;
	domainName: string;
}

export const DomainsTableRowActions = ( {
	canConnectDomainToASite,
	siteSlug,
	domainName,
}: DomainsTableRowActionsProps ) => {
	const { __ } = useI18n();

	if ( ! canConnectDomainToASite ) {
		return null;
	}

	return (
		<DropdownMenu
			className="domains-table-row__actions"
			icon={ <Gridicon icon="ellipsis" /> }
			label={ __( 'Domain actions' ) }
		>
			{ () => (
				<MenuGroup>
					{ canConnectDomainToASite && (
						<MenuItemLink href={ domainManagementTransferToOtherSiteLink( siteSlug, domainName ) }>
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
