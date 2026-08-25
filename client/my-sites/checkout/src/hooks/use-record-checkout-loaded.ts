import debugFactory from 'debug';
import { useRef } from 'react';
import {
	useInitialIsInStepContainerV2FlowContext,
	useInitialStepperFlowFromContext,
} from 'calypso/layout/utils';
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { StoredPaymentMethod } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-record-checkout-loaded' );

export default function useRecordCheckoutLoaded( {
	isLoading,
	responseCart,
	storedCards,
	productAliasFromUrl,
	checkoutFlow,
}: {
	isLoading: boolean;
	responseCart: ResponseCart;
	storedCards: StoredPaymentMethod[];
	productAliasFromUrl: string | undefined | null;
	checkoutFlow: string;
} ): void {
	const reduxDispatch = useDispatch();
	const hasRecordedCheckoutLoad = useRef( false );
	const { currency } = responseCart;
	const isStepContainerV2 = useInitialIsInStepContainerV2FlowContext();
	const stepperFlow = useInitialStepperFlowFromContext();
	if ( ! isLoading && ! hasRecordedCheckoutLoad.current ) {
		debug( 'composite checkout has loaded' );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_page_view', {
				saved_cards: storedCards.length,
				is_renewal: hasRenewalItem( responseCart ),
				is_gift_purchase: responseCart.is_gift_purchase,
				product_slug: productAliasFromUrl,
				is_composite: true,
				checkout_flow: checkoutFlow,
				currency,
				is_step_container_v2: isStepContainerV2,
				...( stepperFlow ? { stepper_flow: stepperFlow } : {} ),
			} )
		);
		reduxDispatch( recordTracksEvent( 'calypso_checkout_composite_loaded', {} ) );

		hasRecordedCheckoutLoad.current = true;
	}
}
