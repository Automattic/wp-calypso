import { FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME } from '@automattic/calypso-products';
import wpcomAtomicTransfer from 'calypso/lib/jetpack/wpcom-atomic-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ComponentType } from 'react';

export function wpcomJetpackBackupAtomicTransfer(
	UpsellComponent: ComponentType
): ( context: any, next: () => void ) => void {
	return ( context, next ) => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );

		// Check if site has real-time backup feature
		const hasRealtimeBackupFeature = siteHasFeature(
			state,
			siteId,
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME
		);

		// If site doesn't have real-time backup feature, show the upsell component directly
		if ( ! hasRealtimeBackupFeature ) {
			context.primary = <UpsellComponent />;
			next();
			// Don't return here - let the middleware chain continue
		} else {
			// If site has real-time backup feature, proceed with atomic transfer logic
			wpcomAtomicTransfer( UpsellComponent )( context, next );
		}
	};
}
