import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { domainRoute } from '../../app/router/domains';
import { emailsRoute } from '../../app/router/emails';
import { SidebarBackButton, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import DomainSwitcherItem from './domain-switcher-item';
import { getBackToSitePath } from './utils';

export default function DomainSidebar() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useQuery( domainQuery( domainName ) );
	const { back_to: backTo } = useSearch( { strict: false } ) as { back_to?: string };

	if ( ! domain ) {
		return null;
	}

	const backToSite = getBackToSitePath( backTo, domain.site_slug );

	return (
		<VStack spacing={ 2 }>
			{ backToSite ? (
				<SidebarBackButton to={ backToSite }>{ __( 'Back to site' ) }</SidebarBackButton>
			) : (
				<SidebarBackButton to="/domains">{ __( 'Back to Domains' ) }</SidebarBackButton>
			) }
			<VStack spacing={ 4 }>
				<DomainSwitcherItem domain={ domain } />
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
