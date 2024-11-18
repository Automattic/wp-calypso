import page from '@automattic/calypso-router';
import canCurrentUserStartSiteOwnerTransfer from 'calypso/state/selectors/can-current-user-start-site-owner-transfer';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isHostingMenuUntangled } from '../utils';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function redirectIfCantStartSiteOwnerTransfer( context: PageJSContext, next: () => void ) {
	const state = context.store.getState();
	if ( ! canCurrentUserStartSiteOwnerTransfer( state, getSelectedSiteId( state ) ) ) {
		return isHostingMenuUntangled()
			? page.redirect( '/sites/settings/administration/' + getSelectedSiteSlug( state ) )
			: page.redirect( '/settings/general/' + getSelectedSiteSlug( state ) );
	}
	next();
}
