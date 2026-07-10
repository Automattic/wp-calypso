import { StripeHookProvider } from '@automattic/calypso-stripe';
import { createRequestCartProduct } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import PurchaseModal from 'calypso/my-sites/checkout/purchase-modal';
import type { SiteSlug } from 'calypso/types';

export default function UpgradePurchaseModal( {
	planSlug,
	siteSlug,
	onClose,
	onPurchaseSuccess,
}: {
	planSlug: string;
	siteSlug: SiteSlug;
	onClose: () => void;
	onPurchaseSuccess: () => void;
} ) {
	const translate = useTranslate();
	const productToAdd = useMemo(
		() => createRequestCartProduct( { product_slug: planSlug } ),
		[ planSlug ]
	);

	return (
		<CalypsoShoppingCartProvider>
			<StripeHookProvider
				fetchStripeConfiguration={ getStripeConfiguration }
				locale={ translate.localeSlug }
			>
				<PurchaseModal
					productToAdd={ productToAdd }
					onClose={ onClose }
					onPurchaseSuccess={ onPurchaseSuccess }
					disabledThankYouPage
					showFeatureList
					siteSlug={ siteSlug }
				/>
			</StripeHookProvider>
		</CalypsoShoppingCartProvider>
	);
}
