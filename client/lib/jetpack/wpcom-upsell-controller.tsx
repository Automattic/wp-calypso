import { isEnabled } from '@automattic/calypso-config';
import BusinessATSwitch from 'calypso/components/jetpack/business-at-switch';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Context } from './types';
import type { ComponentType } from 'react';

export default function upsellSwitch(
	UpsellComponent: ComponentType
): ( context: Context, next: () => void ) => void {
	return ( context, next ) => {
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );
		const isAtomic = isSiteAutomatedTransfer( getState(), siteId );

		if ( ! isEnabled( 'jetpack-cloud' ) && context.primary ) {
			if ( isAtomic ) {
				context.primary = <UpsellComponent />;
			} else if ( ! isJetpack ) {
				context.primary = <BusinessATSwitch UpsellComponent={ UpsellComponent } />;
			}
		}

		next();
	};
}
