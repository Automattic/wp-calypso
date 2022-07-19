import config from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { agencyDashboardContext, pluginManagementContext } from './controller';

export default function (): void {
	page( '/dashboard/:filter(favorites)?', agencyDashboardContext, makeLayout, clientRender );
	const isPluginManagementEnabled = config.isEnabled( 'jetpack/plugin-management' );
	isPluginManagementEnabled &&
		page(
			'/dashboard/plugins/:filter(manage|active|inactive|updates)?',
			pluginManagementContext,
			makeLayout,
			clientRender
		);
}
