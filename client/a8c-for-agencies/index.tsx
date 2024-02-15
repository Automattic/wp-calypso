import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { overviewContext, redirectToOverviewContext, sitesContext } from './controller';

export default function () {
	page( '/', redirectToOverviewContext, makeLayout, clientRender );
	page( '/overview', overviewContext, makeLayout, clientRender );
	page( '/sites', sitesContext, makeLayout, clientRender );
}
