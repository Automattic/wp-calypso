import { agencySiteQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, backup, shield } from '@wordpress/icons';
import { agencySiteRoute } from '../../../app/router/agency';
import {
	SidebarBackButton,
	SidebarExpandableMenuItem,
	SidebarMenu,
	SidebarMenuItem,
} from '../../../components/sidebar';
import AgencySiteSwitcherItem from './site-switcher-item';

export default function AgencySiteSidebar() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useQuery( agencySiteQuery( siteSlug ) );

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/sites">{ __( 'Back to Sites' ) }</SidebarBackButton>
			{ site && (
				<VStack spacing={ 4 }>
					<SidebarMenu>
						<AgencySiteSwitcherItem site={ site } />
					</SidebarMenu>
					<SidebarMenu>
						<SidebarMenuItem
							icon={ category }
							to={ `/sites/${ siteSlug }` }
							activeOptions={ { exact: true } }
						>
							{ __( 'Overview' ) }
						</SidebarMenuItem>
						{ site.has_backup && (
							<SidebarMenuItem icon={ backup } to={ `/sites/${ siteSlug }/backups` }>
								{ __( 'Backups' ) }
							</SidebarMenuItem>
						) }
						{ site.has_scan && (
							<SidebarExpandableMenuItem
								label={ __( 'Scan' ) }
								icon={ shield }
								to={ `/sites/${ siteSlug }/scan` }
							>
								<SidebarMenuItem to={ `/sites/${ siteSlug }/scan/active` }>
									{ __( 'Active threats' ) }
								</SidebarMenuItem>
								<SidebarMenuItem to={ `/sites/${ siteSlug }/scan/history` }>
									{ __( 'History' ) }
								</SidebarMenuItem>
							</SidebarExpandableMenuItem>
						) }
					</SidebarMenu>
				</VStack>
			) }
		</VStack>
	);
}
