import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

function hasSiteProductJetpackStatsPWYWOnly(
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean {
	const sitePurchases = getSitePurchases( state, siteId );
	console.log( 'sitePurchases: ', sitePurchases.length );

	return true;
}

export default hasSiteProductJetpackStatsPWYWOnly;
