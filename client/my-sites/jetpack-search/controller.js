/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackSearchMain from './main';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import JetpackSearchDisconnected from './disconnected';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

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

	context.primary = <JetpackSearchMain siteId={ siteId } />;
	next();
}
