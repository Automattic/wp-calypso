import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { renderPluginsDashboard } from 'calypso/my-sites/plugins/controller';
import { pluginsContext, pluginManagementContext, pluginDetailsContext } from './controller';

import './style.scss';

export default function () {
	page( '/plugins', requireAccessContext, pluginsContext, makeLayout, clientRender );

	page( '/plugins/:slug', requireAccessContext, pluginsContext, makeLayout, clientRender );

	page(
		'/plugins/manage/sites',
		requireAccessContext,
		pluginManagementContext,
		renderPluginsDashboard,
		makeLayout,
		clientRender
	);

	page(
		'/plugins/manage/sites/:slug',
		requireAccessContext,
		pluginDetailsContext,
		renderPluginsDashboard,
		makeLayout,
		clientRender
	);
}
