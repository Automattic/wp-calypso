import { isEnabled } from '@automattic/calypso-config';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { MiniCart } from '@automattic/mini-cart';
import { wpcomLink } from '../../utils/link';
import { useAnalytics } from '../analytics';

import './omnibar-shopping-cart-panel.scss';

export default function OmnibarShoppingCartPanel( {
	siteId,
	siteSlug,
	onClose,
}: {
	siteId: number;
	siteSlug: string;
	onClose: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();

	const recordRemoval = ( uuid = 'coupon' ) =>
		recordTracksEvent( 'calypso_masterbar_cart_remove_product', { uuid } );

	return (
		<CheckoutErrorBoundary errorMessage="Error">
			<MiniCart
				selectedSiteSlug={ siteSlug }
				cartKey={ siteId }
				goToCheckout={ ( slug ) => {
					recordTracksEvent( 'calypso_masterbar_cart_go_to_checkout' );
					window.location.href = wpcomLink( `/checkout/${ slug }` );
				} }
				closeCart={ onClose }
				onRemoveProduct={ recordRemoval }
				onRemoveCoupon={ recordRemoval }
				onRemoveBundle={ ( groupId, memberCount ) =>
					recordTracksEvent( 'calypso_domain_bundle_removed_from_cart', {
						domain_bundle_group_id: groupId,
						domain_count: memberCount,
					} )
				}
				showBundleGrouping={ isEnabled( 'domain-bundling' ) }
			/>
		</CheckoutErrorBoundary>
	);
}
