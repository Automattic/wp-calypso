import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, useNavigator } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { emailsRoute } from '../../app/router/emails';
import { SidebarBackButton, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import DomainSwitcher from '../domain-switcher';

export default function DomainSidebar() {
	const { params } = useNavigator();
	const domainName = params.domainName as string;

	const { data: domain } = useQuery( domainQuery( domainName ) );

	if ( ! domain ) {
		return null;
	}

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/domains">{ __( 'Back to Domains' ) }</SidebarBackButton>
			<VStack spacing={ 4 }>
				<DomainSwitcher domain={ domain } />
				<DomainMenuSidebar domainName={ domainName } />
			</VStack>
		</VStack>
	);
}

function DomainMenuSidebar( { domainName }: { domainName: string } ) {
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
}
