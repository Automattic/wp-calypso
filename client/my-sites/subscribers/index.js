import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	amendCurrentSection,
	subscribers,
	subscriberDetails,
	externalSubscriberDetails,
} from './controller';

export default function () {
	page( '/subscribers', siteSelection, sites, makeLayout, clientRender );

	page(
		'/subscribers/:domain',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'list_users' ),
		subscribers,
		amendCurrentSection,
		makeLayout,
		clientRender
	);
	page(
		'/subscribers/:domain/:user',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'list_users' ),
		subscriberDetails,
		amendCurrentSection,
		makeLayout,
		clientRender
	);
	page(
		'/subscribers/external/:domain/:subscriber',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'list_users' ),
		externalSubscriberDetails,
		amendCurrentSection,
		makeLayout,
		clientRender
	);
}
