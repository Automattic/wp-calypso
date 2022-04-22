import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { socialPath } from 'calypso/lib/jetpack/paths';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { connections } from './controller';

export default function () {
	if ( isJetpackCloud() ) {
		page( socialPath(), siteSelection, sites, makeLayout, clientRender );
		page( socialPath( ':site' ), siteSelection, navigation, connections, makeLayout, clientRender );
	}
}
