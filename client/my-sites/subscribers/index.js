import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	subscribers,
	subscriberDetails,
	externalSubscriberDetails,
	redirectIfInsufficientPrivileges,
} from './controller';

export default function () {
	page(
		'/subscribers',
		siteSelection,
		sites,
		navigation,
		redirectIfInsufficientPrivileges,
		makeLayout,
		clientRender
	);
	page(
		'/subscribers/:domain',
		siteSelection,
		navigation,
		redirectIfInsufficientPrivileges,
		subscribers,
		makeLayout,
		clientRender
	);
	page(
		'/subscribers/:domain/:user',
		siteSelection,
		navigation,
		redirectIfInsufficientPrivileges,
		subscriberDetails,
		makeLayout,
		clientRender
	);
	page(
		'/subscribers/external/:domain/:subscriber',
		siteSelection,
		navigation,
		redirectIfInsufficientPrivileges,
		externalSubscriberDetails,
		makeLayout,
		clientRender
	);
}
