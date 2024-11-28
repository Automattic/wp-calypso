import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import HostingFeatures from 'calypso/sites/hosting-features/components/hosting-features';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import Database from './database/page';
import {
	DeploymentCreation,
	DeploymentManagement,
	DeploymentRunLogs,
	Deployments,
} from './deployments';
import { indexPage } from './deployments/routes';
import Logs from './logs';
import Monitoring from './monitoring';
import useSftpSshSettingTitle from './sftp-ssh/hooks/use-sftp-ssh-setting-title';
import SftpSsh from './sftp-ssh/page';
import StagingSite from './staging-site';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function ToolsSidebar() {
	const slug = useSelector( getSelectedSiteSlug );

	const sftpSshTitle = useSftpSshSettingTitle();

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/tools/staging-site/${ slug }` }>
				{ __( 'Staging site' ) }
			</SidebarItem>
			<SidebarItem href={ `/sites/tools/deployments/${ slug }` }>
				{ __( 'Deployments' ) }
			</SidebarItem>
			<SidebarItem href={ `/sites/tools/monitoring/${ slug }` }>{ __( 'Monitoring' ) }</SidebarItem>
			<SidebarItem href={ `/sites/tools/logs/${ slug }` }>{ __( 'Logs' ) }</SidebarItem>
			<SidebarItem href={ `/sites/tools/sftp-ssh/${ slug }` }>{ sftpSshTitle }</SidebarItem>
			<SidebarItem href={ `/sites/tools/database/${ slug }` }>{ __( 'Database' ) }</SidebarItem>
		</Sidebar>
	);
}

export function tools( context: PageJSContext, next: () => void ) {
	context.primary = <HostingFeatures showAsTools />;
	next();
}

export function stagingSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<StagingSite />
		</PanelWithSidebar>
	);
	next();
}

export function deployments( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<Deployments />
		</PanelWithSidebar>
	);
	next();
}

export function deploymentCreation( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<DeploymentCreation />
		</PanelWithSidebar>
	);
	next();
}

export function deploymentManagement( context: PageJSContext, next: () => void ) {
	const codeDeploymentId = parseInt( context.params.deploymentId, 10 ) || null;
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! codeDeploymentId ) {
		return context.page.replace( indexPage( siteSlug! ) );
	}

	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<DeploymentManagement codeDeploymentId={ codeDeploymentId } />
		</PanelWithSidebar>
	);
	next();
}

export function deploymentRunLogs( context: PageJSContext, next: () => void ) {
	const codeDeploymentId = parseInt( context.params.deploymentId, 10 ) || null;
	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	if ( ! codeDeploymentId ) {
		return context.page.replace( indexPage( siteSlug! ) );
	}

	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<DeploymentRunLogs codeDeploymentId={ codeDeploymentId } />
		</PanelWithSidebar>
	);
	next();
}

export function monitoring( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<Monitoring />
		</PanelWithSidebar>
	);
	next();
}

export function phpErrorLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<Logs logType="php" />
		</PanelWithSidebar>
	);
	next();
}

export function webServerLogs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<Logs logType="web" />
		</PanelWithSidebar>
	);
	next();
}

export function sftpSsh( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<SftpSsh />
		</PanelWithSidebar>
	);
	next();
}

export function database( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<Database />
		</PanelWithSidebar>
	);
	next();
}
