/**
 * External dependencies
 */
import { useDispatch } from 'react-redux';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import type { ReactStandardAction } from '../types/analytics';
import type { GetThankYouUrl } from '../hooks/use-get-thank-you-url';
import type { ManagedContactDetails } from '../types/wpcom-store-state';

export interface PaymentProcessorOptions {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
	createUserAndSiteBeforeTransaction: boolean;
	stripeConfiguration: StripeConfiguration | null;
	recordEvent: ( action: ReactStandardAction ) => void;
	reduxDispatch: ReturnType< typeof useDispatch >;
	responseCart: ResponseCart;
	getThankYouUrl: GetThankYouUrl;
	siteSlug: string | undefined;
	siteId: number | undefined;
	contactDetails: ManagedContactDetails | undefined;
}
