/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackSearchMainJetpack from './main-jetpack';
import JetpackSearchMainWpcomSimple from './main-wpcom-simple';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import JetpackSearchDisconnected from './disconnected';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { isJetpackSite } from 'calypso/state/sites/selectors';

export function showJetpackIsDisconnected( context, next ) {
	context.primary = (
		<IsJetpackDisconnectedSwitch
			trueComponent={ <JetpackSearchDisconnected /> }
			falseComponent={ context.primary }
		/>
	);
	next();
}

/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
export function jetpackSearchMain( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );

	context.primary = isJetpack ? (
		<JetpackSearchMainJetpack siteId={ siteId } />
	) : (
		<JetpackSearchMainWpcomSimple siteId={ siteId } />
	);
	next();
}
