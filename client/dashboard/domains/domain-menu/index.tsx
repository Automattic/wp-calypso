import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { emailsRoute } from '../../app/router/emails';
import { SidebarMenu, SidebarMenuItem } from '../../components/sidebar';

const DomainMenu = ( { domainName }: { domainName: string } ) => {
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

export default DomainMenu;
