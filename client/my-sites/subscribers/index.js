import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { subscribers } from './controller';

export default function () {
	page( '/subscribers', siteSelection, sites, makeLayout, clientRender );

	page(
		'/subscribers/:domain',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'list_users' ),
		subscribers,
		makeLayout,
		clientRender
	);
}
