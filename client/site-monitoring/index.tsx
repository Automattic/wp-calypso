import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import {
	siteMonitoringOverview,
	siteMonitoringPhpLogs,
	siteMonitoringServerLogs,
} from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );
	page( '/site-monitoring/:site', siteSelection, siteMonitoringOverview, makeLayout, clientRender );
	page(
		'/site-monitoring/:site/php',
		siteSelection,
		siteMonitoringPhpLogs,
		makeLayout,
		clientRender
	);
	page(
		'/site-monitoring/:site/web',
		siteSelection,
		siteMonitoringServerLogs,
		makeLayout,
		clientRender
	);
}
