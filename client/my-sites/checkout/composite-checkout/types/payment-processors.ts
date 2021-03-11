/**
 * External dependencies
 */
import { useDispatch } from 'react-redux';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { LineItem } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import type { ReactStandardAction } from '../types/analytics';
import type { WPCOMCartItem } from '../types/checkout-cart';

export interface PaymentProcessorOptions {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
	createUserAndSiteBeforeTransaction: boolean;
	stripeConfiguration: StripeConfiguration | null;
	recordEvent: ( action: ReactStandardAction ) => void;
	reduxDispatch: ReturnType< typeof useDispatch >;
	items: WPCOMCartItem[];
	total: LineItem;
}
