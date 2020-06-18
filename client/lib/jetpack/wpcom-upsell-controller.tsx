/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import type { Context } from './types';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import BusinessATSwitch from 'components/jetpack/business-at-switch';

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
