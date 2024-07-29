import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { createRequestCartProduct } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { getRazorpayConfiguration, getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import PurchaseModal from 'calypso/my-sites/checkout/purchase-modal';
import { successNotice } from 'calypso/state/notices/actions';
import { SiteSlug } from 'calypso/types';

export default function PurchaseModalWrapper( {
	plan,
	siteSlug,
	setShowPurchaseModal,
}: {
	plan?: string;
	siteSlug: SiteSlug;
	setShowPurchaseModal: ( arg: boolean ) => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const product = useMemo(
		() => ( plan ? createRequestCartProduct( { product_slug: plan } ) : null ),
		[ plan ]
	);
	return product ? (
		<CalypsoShoppingCartProvider>
			<StripeHookProvider
				fetchStripeConfiguration={ getStripeConfiguration }
				locale={ translate.localeSlug }
			>
				<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
					<PurchaseModal
						productToAdd={ product }
						onClose={ () => {
							setShowPurchaseModal( false );
						} }
						onPurchaseSuccess={ () => {
							setShowPurchaseModal( false );
							dispatch(
								successNotice( translate( 'Your purchase has been completed!' ), {
									id: 'plugins-purchase-modal-success',
								} )
							);
						} }
						disabledThankYouPage
						showFeatureList
						siteSlug={ siteSlug }
					/>
				</RazorpayHookProvider>
			</StripeHookProvider>
		</CalypsoShoppingCartProvider>
	) : null;
}
