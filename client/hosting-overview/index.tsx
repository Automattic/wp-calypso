import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import { hostingOverview, hostingConfig } from './controller';

export default function () {
	page( '/hosting-overview', siteSelection, sites, makeLayout, clientRender );
	page( '/hosting-overview/:site', siteSelection, hostingOverview, makeLayout, clientRender );

	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );
	page( '/hosting-config/:site', siteSelection, hostingConfig, makeLayout, clientRender );
}
