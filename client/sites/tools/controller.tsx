import { __ } from '@wordpress/i18n';
import { GitHubDeployments } from 'calypso/hosting/deployments/deployments';
import { SiteLogs } from 'calypso/hosting/logs/components/site-logs';
import { SiteLogsHeader } from 'calypso/hosting/logs/components/site-logs-header';
import { SiteMonitoring } from 'calypso/hosting/monitoring/components/site-monitoring';
import PhpMyAdminCard from 'calypso/hosting/server-settings/components/phpmyadmin-card';
import { SftpCard } from 'calypso/hosting/server-settings/components/sftp-card';
import StagingSite from 'calypso/hosting/staging-site/components/staging-site';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
import type { Context as PageJSContext } from '@automattic/calypso-router';

const ToolsSidebar = makeSidebar( {
	items: [
		{
			key: 'staging-site',
			get label() {
				return __( 'Staging Site' );
			},
		},
		{
			key: 'deployments',
			get label() {
				return __( 'Deployments' );
			},
		},
		{
			key: 'monitoring',
			get label() {
				return __( 'Monitoring' );
			},
		},
		{
			key: 'logs',
			get label() {
				return __( 'Logs' );
			},
		},
		{
			key: 'sftp-ssh',
			get label() {
				return __( 'SFTP/SSH' );
			},
		},
		{
			key: 'database',
			get label() {
				return __( 'Database' );
			},
		},
	],
} );

export function stagingSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar selectedItemKey="staging-site" />
			<StagingSite />
		</PanelWithSidebar>
	);
	next();
}

export function deployments( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar selectedItemKey="deployments" />
			<GitHubDeployments />
		</PanelWithSidebar>
	);
	next();
}

export function monitoring( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar selectedItemKey="monitoring" />
			<SiteMonitoring />
		</PanelWithSidebar>
	);
	next();
}

export function logs( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar selectedItemKey="logs" />
			<div>
				<SiteLogsHeader logType="web" />
				<SiteLogs logType="web" />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function sftp( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar selectedItemKey="sftp-ssh" />
			<SftpCard />
		</PanelWithSidebar>
	);
	next();
}

export function database( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<ToolsSidebar selectedItemKey="database" />
			<PhpMyAdminCard />
		</PanelWithSidebar>
	);
	next();
}
