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
	context.primary = <JetpackSearchMain />;
	next();
}
