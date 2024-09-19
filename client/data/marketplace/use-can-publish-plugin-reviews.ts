import { useSelector } from 'react-redux';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

/**
 * Checks if the current user can post reviews for a given plugin.
 * @param {{}} plugin the given plugin with its variations
 * @returns {boolean} true if the user is logged in and has purchased the plugin.
 */
export function useCanPublishPluginReview( plugin = { isMarketplaceProduct: false } ) {
	const { isMarketplaceProduct } = plugin;
	const isLoggedIn = useSelector( isUserLoggedIn );

	const purchases = useSelector( getUserPurchases );
	const purchasedPlugin = getPluginPurchased( plugin, purchases || [] );
	const hasActiveSubscription = !! purchasedPlugin;

	return isLoggedIn && ( ! isMarketplaceProduct || hasActiveSubscription );
}
