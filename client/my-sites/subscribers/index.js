import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { subscribers } from './controller';

export default function () {
	page( '/subscribers', siteSelection, sites, navigation, makeLayout, clientRender );

	page( '/subscribers/:domain', siteSelection, navigation, subscribers, makeLayout, clientRender );
}
