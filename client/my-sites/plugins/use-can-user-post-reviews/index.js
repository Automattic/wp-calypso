import { useSelector } from 'react-redux';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Checks if the current user can post reviews for a given plugin.
 * @param {{}} plugin the given plugin with its variations
 * @returns {boolean} true if the user is logged in and has purchased the plugin.
 */
export function useCanUserPostReviews( plugin ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	const selectedSite = useSelector( getSelectedSite );
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const purchasedPlugin = getPluginPurchased( plugin, purchases );

	return isLoggedIn && !! purchasedPlugin;
}
