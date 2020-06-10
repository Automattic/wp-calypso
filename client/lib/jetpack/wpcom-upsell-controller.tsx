/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import type { Context } from './types';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

export default function upsellSwitch( UpsellComponent: typeof React.Component ): Function {
	return ( context: Context, next: Function ) => {
		if ( isEnabled( 'jetpack-cloud' ) ) {
			return next();
		}
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );

		if ( ! isJetpack ) {
			context.primary = <UpsellComponent />;
		}

		next();
	};
}
