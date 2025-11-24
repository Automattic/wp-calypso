import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hideMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';
import ClientCheckoutV2 from '../client/primary/checkout-v2';

export const clientExpressCheckout: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = (
		<>
			<PageViewTracker title="Client > Express Checkout" path="/client/express-checkout" />
			<ClientCheckoutV2 />
		</>
	);
	next();
};
