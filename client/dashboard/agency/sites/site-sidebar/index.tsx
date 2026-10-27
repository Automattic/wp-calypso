import { activeAgencyQuery, agencySiteQuery, siteBySlugQuery } from '@automattic/api-queries';
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
import { isTeamMemberWithoutSiteAccess } from '../site/access';
import AgencySiteSwitcherItem from './site-switcher-item';
import type { SiteTypeFeature } from '../../../utils/site-type-feature-support';

export default function AgencySiteSidebar() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useQuery( agencySiteQuery( siteSlug ) );
	const { data: fullSite } = useQuery( siteBySlugQuery( siteSlug ) );
	const { data: agency } = useQuery( activeAgencyQuery() );
	// Team members without access to the site only get the overview, which
	// explains how to get access.
	const canManage = !! fullSite && ! isTeamMemberWithoutSiteAccess( fullSite, agency );
	const supports = ( feature: SiteTypeFeature ) =>
		!! fullSite && canManage && siteTypeSupportsFeature( fullSite, feature );
	const supportsPerformance = supports( 'performance' );
	const supportsMonitoring = supports( 'monitoring' );
	const supportsDeployments = supports( 'deployments' );
	const supportsSettings = supports( 'settings' ) && !! fullSite?.capabilities?.manage_options;

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
						{ supportsPerformance && (
							<SidebarMenuItem icon={ chartBar } to={ `/sites/${ siteSlug }/performance` }>
								{ __( 'Performance' ) }
							</SidebarMenuItem>
						) }
						{ canManage && site.has_backup && (
							<SidebarMenuItem icon={ backup } to={ `/sites/${ siteSlug }/backups` }>
								{ __( 'Backups' ) }
							</SidebarMenuItem>
						) }
						{ canManage && site.has_scan && (
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
						{ supportsMonitoring && (
							<SidebarMenuItem icon={ pending } to={ `/sites/${ siteSlug }/monitoring` }>
								{ __( 'Monitoring' ) }
							</SidebarMenuItem>
						) }
						{ canManage && (
							<SidebarExpandableMenuItem
								label={ __( 'Logs' ) }
								icon={ formatListBullets }
								to={ `/sites/${ siteSlug }/logs/activity` }
							>
								<SidebarMenuItem to={ `/sites/${ siteSlug }/logs/activity` }>
									{ __( 'Activity' ) }
								</SidebarMenuItem>
							</SidebarExpandableMenuItem>
						) }
						{ supportsDeployments && (
							<SidebarMenuItem icon={ code } to={ `/sites/${ siteSlug }/deployments` }>
								{ __( 'Deployments' ) }
							</SidebarMenuItem>
						) }
						{ supportsSettings && (
							<SidebarMenuItem icon={ settings } to={ `/sites/${ siteSlug }/settings` }>
								{ __( 'Settings' ) }
							</SidebarMenuItem>
						) }
					</SidebarMenu>
				</VStack>
			) }
		</VStack>
	);
}
