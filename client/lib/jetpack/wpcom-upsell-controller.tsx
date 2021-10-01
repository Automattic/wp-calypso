import { isEnabled } from '@automattic/calypso-config';
import * as React from 'react';
import BusinessATSwitch from 'calypso/components/jetpack/business-at-switch';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Context } from './types';

export default function upsellSwitch(
	UpsellComponent: React.Component
): ( context: Context, next: () => void ) => void {
	return ( context, next ) => {
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );

		if ( ! isJetpack && ! isEnabled( 'jetpack-cloud' ) && context.primary ) {
			context.primary = <BusinessATSwitch UpsellComponent={ UpsellComponent } />;
		}

		next();
	};
}
