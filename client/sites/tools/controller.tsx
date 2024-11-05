import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import Logs from './logs';
import Monitoring from './monitoring';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function ToolsSidebar() {
	const slug = useSelector( getSelectedSiteSlug );

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
			<SidebarItem href={ `/sites/tools/sftp-ssh/${ slug }` }>{ __( 'SFTP/SSH' ) }</SidebarItem>
			<SidebarItem href={ `/sites/tools/database/${ slug }` }>{ __( 'Database' ) }</SidebarItem>
		</Sidebar>
	);
}

export function stagingSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<p>Staging site</p>
		</PanelWithSidebar>
	);
	next();
}

export function deployments( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<p>Deployments</p>
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
			<p>SFTP/SSH</p>
		</PanelWithSidebar>
	);
	next();
}

export function database( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar />
			<p>Database</p>
		</PanelWithSidebar>
	);
	next();
}
