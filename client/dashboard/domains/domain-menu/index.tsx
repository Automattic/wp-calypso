import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { emailsRoute } from '../../app/router/emails';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';
import { SidebarMenu, SidebarMenuItem } from '../../components/sidebar';

export const DomainMenuSidebar = ( { domainName }: { domainName: string } ) => {
	const { supports } = useAppContext();
	const router = useRouter();

	return (
		<SidebarMenu>
			<SidebarMenuItem icon={ category } to={ `/domains/${ domainName }` }>
				{ __( 'Overview' ) }
			</SidebarMenuItem>
			{ supports.emails && (
				<SidebarMenuItem
					icon={ envelope }
					to={
						router.buildLocation( {
							to: emailsRoute.fullPath,
							search: { domainName },
						} ).href
					}
				>
					{ __( 'Emails' ) }
				</SidebarMenuItem>
			) }
		</SidebarMenu>
	);
};

const DomainMenu = ( { domainName }: { domainName: string } ) => {
	const { supports } = useAppContext();
	const router = useRouter();

	return (
		<ResponsiveMenu label={ __( 'Domain Menu' ) } prefix={ <MenuDivider /> }>
			<ResponsiveMenu.Item to={ `/domains/${ domainName }` }>
				{ __( 'Overview' ) }
			</ResponsiveMenu.Item>
			{ supports.emails && (
				<ResponsiveMenu.Item
					to={ router.buildLocation( { to: emailsRoute.fullPath, search: { domainName } } ).href }
				>
					{ __( 'Emails' ) }
				</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default DomainMenu;
