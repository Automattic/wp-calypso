import { agencySiteQuery, siteBySlugQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
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
import { siteRoute } from '../../../app/router/sites';
import {
	SidebarBackButton,
	SidebarExpandableMenuItem,
	SidebarMenu,
	SidebarMenuItem,
} from '../../../components/sidebar';
import { siteTypeSupportsFeature } from '../../../utils/site-type-feature-support';
import AgencySiteSwitcherItem from './site-switcher-item';

export default function AgencySiteSidebar() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( agencySiteQuery( siteSlug ) );
	const { data: fullSite } = useQuery( siteBySlugQuery( siteSlug ) );
	const supportsBackups = fullSite ? siteTypeSupportsFeature( fullSite, 'backups' ) : false;
	const supportsScan = fullSite ? siteTypeSupportsFeature( fullSite, 'scan' ) : false;
	const supportsPerformance = fullSite ? siteTypeSupportsFeature( fullSite, 'performance' ) : false;
	const supportsMonitoring = fullSite ? siteTypeSupportsFeature( fullSite, 'monitoring' ) : false;
	const supportsDeployments = fullSite ? siteTypeSupportsFeature( fullSite, 'deployments' ) : false;
	const supportsHostingLogs = fullSite ? siteTypeSupportsFeature( fullSite, 'logs' ) : false;
	const supportsSettings = fullSite
		? siteTypeSupportsFeature( fullSite, 'settings' ) && !! fullSite.capabilities?.manage_options
		: false;
	const isApmEnabled = isEnabled( 'performance/apm' );

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
						{ supportsPerformance &&
							( isApmEnabled ? (
								<SidebarExpandableMenuItem
									label={ __( 'Performance' ) }
									icon={ chartBar }
									to={ `/sites/${ siteSlug }/performance` }
								>
									<SidebarMenuItem to={ `/sites/${ siteSlug }/performance/frontend` }>
										{ __( 'Frontend' ) }
									</SidebarMenuItem>
									<SidebarMenuItem to={ `/sites/${ siteSlug }/performance/backend` }>
										{ __( 'Backend' ) }
									</SidebarMenuItem>
								</SidebarExpandableMenuItem>
							) : (
								<SidebarMenuItem icon={ chartBar } to={ `/sites/${ siteSlug }/performance` }>
									{ __( 'Performance' ) }
								</SidebarMenuItem>
							) ) }
						{ site.has_backup && supportsBackups && (
							<SidebarMenuItem icon={ backup } to={ `/sites/${ siteSlug }/backups` }>
								{ __( 'Backups' ) }
							</SidebarMenuItem>
						) }
						{ site.has_scan && supportsScan && (
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
						{ supportsDeployments && (
							<SidebarMenuItem icon={ code } to={ `/sites/${ siteSlug }/deployments` }>
								{ __( 'Deployments' ) }
							</SidebarMenuItem>
						) }
						{ supportsMonitoring && (
							<SidebarMenuItem icon={ pending } to={ `/sites/${ siteSlug }/monitoring` }>
								{ __( 'Monitoring' ) }
							</SidebarMenuItem>
						) }
						<SidebarExpandableMenuItem
							label={ __( 'Logs' ) }
							icon={ formatListBullets }
							to={ `/sites/${ siteSlug }/logs/activity` }
						>
							<SidebarMenuItem to={ `/sites/${ siteSlug }/logs/activity` }>
								{ __( 'Activity' ) }
							</SidebarMenuItem>
							{ supportsHostingLogs && (
								<SidebarMenuItem to={ `/sites/${ siteSlug }/logs/php` }>
									{ __( 'PHP' ) }
								</SidebarMenuItem>
							) }
							{ supportsHostingLogs && (
								<SidebarMenuItem to={ `/sites/${ siteSlug }/logs/server` }>
									{ __( 'Server' ) }
								</SidebarMenuItem>
							) }
						</SidebarExpandableMenuItem>
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
