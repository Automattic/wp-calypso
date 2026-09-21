import { agencySiteQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	backup,
	category,
	chartBar,
	code,
	formatListBullets,
	pending,
	settings,
	shield,
} from '@wordpress/icons';
import { agencySiteRoute } from '../../../app/router/agency';
import {
	SidebarBackButton,
	SidebarExpandableMenuItem,
	SidebarMenu,
	SidebarMenuItem,
} from '../../../components/sidebar';
import { siteTypeSupportsFeature } from '../../../utils/site-type-feature-support';
import AgencySiteSwitcherItem from './site-switcher-item';

export default function AgencySiteSidebar() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useQuery( agencySiteQuery( siteSlug ) );
	const { data: fullSite } = useQuery( siteBySlugQuery( siteSlug ) );
	const supportsPerformance = fullSite ? siteTypeSupportsFeature( fullSite, 'performance' ) : false;
	const supportsMonitoring = fullSite ? siteTypeSupportsFeature( fullSite, 'monitoring' ) : false;
	const supportsDeployments = fullSite ? siteTypeSupportsFeature( fullSite, 'deployments' ) : false;
	const supportsSettings = fullSite
		? siteTypeSupportsFeature( fullSite, 'settings' ) && !! fullSite.capabilities?.manage_options
		: false;

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/client-work/sites">{ __( 'Back to Sites' ) }</SidebarBackButton>
			{ site && (
				<VStack spacing={ 4 }>
					<SidebarMenu>
						<AgencySiteSwitcherItem site={ site } />
					</SidebarMenu>
					<SidebarMenu>
						<SidebarMenuItem
							icon={ category }
							to={ `/client-work/sites/${ siteSlug }` }
							activeOptions={ { exact: true } }
						>
							{ __( 'Overview' ) }
						</SidebarMenuItem>
						{ supportsPerformance && (
							<SidebarMenuItem
								icon={ chartBar }
								to={ `/client-work/sites/${ siteSlug }/performance` }
							>
								{ __( 'Performance' ) }
							</SidebarMenuItem>
						) }
						{ site.has_backup && (
							<SidebarMenuItem icon={ backup } to={ `/client-work/sites/${ siteSlug }/backups` }>
								{ __( 'Backups' ) }
							</SidebarMenuItem>
						) }
						{ site.has_scan && (
							<SidebarExpandableMenuItem
								label={ __( 'Scan' ) }
								icon={ shield }
								to={ `/client-work/sites/${ siteSlug }/scan` }
							>
								<SidebarMenuItem to={ `/client-work/sites/${ siteSlug }/scan/active` }>
									{ __( 'Active threats' ) }
								</SidebarMenuItem>
								<SidebarMenuItem to={ `/client-work/sites/${ siteSlug }/scan/history` }>
									{ __( 'History' ) }
								</SidebarMenuItem>
							</SidebarExpandableMenuItem>
						) }
						{ supportsMonitoring && (
							<SidebarMenuItem
								icon={ pending }
								to={ `/client-work/sites/${ siteSlug }/monitoring` }
							>
								{ __( 'Monitoring' ) }
							</SidebarMenuItem>
						) }
						<SidebarExpandableMenuItem
							label={ __( 'Logs' ) }
							icon={ formatListBullets }
							to={ `/client-work/sites/${ siteSlug }/logs/activity` }
						>
							<SidebarMenuItem to={ `/client-work/sites/${ siteSlug }/logs/activity` }>
								{ __( 'Activity' ) }
							</SidebarMenuItem>
						</SidebarExpandableMenuItem>
						{ supportsDeployments && (
							<SidebarMenuItem icon={ code } to={ `/client-work/sites/${ siteSlug }/deployments` }>
								{ __( 'Deployments' ) }
							</SidebarMenuItem>
						) }
						{ supportsSettings && (
							<SidebarMenuItem icon={ settings } to={ `/client-work/sites/${ siteSlug }/settings` }>
								{ __( 'Settings' ) }
							</SidebarMenuItem>
						) }
					</SidebarMenu>
				</VStack>
			) }
		</VStack>
	);
}
