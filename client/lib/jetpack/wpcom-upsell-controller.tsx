/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import type { Context } from './types';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import BusinessATSwitch from 'calypso/components/jetpack/business-at-switch';

export default function upsellSwitch( UpsellComponent: typeof React.Component ): Function {
	return ( context: Context, next: Function ) => {
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );

		if ( ! isJetpack && ! isEnabled( 'jetpack-cloud' ) && context.primary ) {
			context.primary = <BusinessATSwitch UpsellComponent={ UpsellComponent } />;
		}

		next();
	};
}
