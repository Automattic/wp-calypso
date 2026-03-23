import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { emailsRoute } from '../../app/router/emails';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';

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
