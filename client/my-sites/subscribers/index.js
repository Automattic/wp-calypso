import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { subscribers, subscriberDetails, externalSubscriberDetails } from './controller';

export default function () {
	page( '/subscribers', siteSelection, sites, navigation, makeLayout, clientRender );
	page( '/subscribers/:domain', siteSelection, navigation, subscribers, makeLayout, clientRender );
	page(
		'/subscribers/:domain/:user',
		siteSelection,
		navigation,
		subscriberDetails,
		makeLayout,
		clientRender
	);
	page(
		'/subscribers/external/:domain/:subscriber',
		siteSelection,
		navigation,
		externalSubscriberDetails,
		makeLayout,
		clientRender
	);
}
