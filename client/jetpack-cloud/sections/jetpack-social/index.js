import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { socialPath } from 'calypso/lib/jetpack/paths';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { placeholder, redirectIfNotJetpackCloud } from './controller';

export default function () {
	page( socialPath(), siteSelection, redirectIfNotJetpackCloud, sites, makeLayout, clientRender );
	page(
		socialPath( ':site' ),
		siteSelection,
		redirectIfNotJetpackCloud,
		navigation,
		placeholder,
		makeLayout,
		clientRender
	);
}
