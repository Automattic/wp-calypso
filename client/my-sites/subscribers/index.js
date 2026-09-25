import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectToNewsletter, subscribers } from './controller';

export default function () {
	page( '/subscribers', siteSelection, sites, makeLayout, clientRender );

	page(
		'/subscribers/:domain',
		siteSelection,
		redirectToNewsletter,
		navigation,
		redirectIfCurrentUserCannot( 'list_users' ),
		subscribers,
		makeLayout,
		clientRender
	);

	page(
		'/subscribers/:domain/:subscriberId',
		siteSelection,
		redirectToNewsletter,
		navigation,
		redirectIfCurrentUserCannot( 'list_users' ),
		subscribers,
		makeLayout,
		clientRender
	);
}
