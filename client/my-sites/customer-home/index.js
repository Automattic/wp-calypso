import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import home, { maybeRedirect } from './controller';

export default function () {
	page( '/home', siteSelection, sites, makeLayout, clientRender );

	page( '/home/:siteId', siteSelection, maybeRedirect, navigation, home, makeLayout, clientRender );
}
