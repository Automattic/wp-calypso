import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sitesContext } from './controller';

export default function () {
	page( '/sites/:category/:siteUrl/:feature', sitesContext, makeLayout, clientRender );
	page( '/sites/:category/:siteUrl', sitesContext, makeLayout, clientRender );
	page( '/sites/:category', sitesContext, makeLayout, clientRender );
	page( '/sites', sitesContext, makeLayout, clientRender );
}
