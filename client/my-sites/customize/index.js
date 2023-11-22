import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { customize } from './controller';

export default function () {
	page( '/customize/:panel([^.]+)?', siteSelection, sites, makeLayout, clientRender );
	page(
		'/customize/:panel?/:domain',
		siteSelection,
		navigation,
		customize,
		makeLayout,
		clientRender
	);
}
