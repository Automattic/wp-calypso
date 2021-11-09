import { useDispatch } from 'react-redux';
import type { GetThankYouUrl } from '../hooks/use-get-thank-you-url';
import type { ReactStandardAction } from '../types/analytics';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';
import type { Stripe } from '@stripe/stripe-js';

export interface PaymentProcessorOptions {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
	createUserAndSiteBeforeTransaction: boolean;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	recordEvent: ( action: ReactStandardAction ) => void;
	reduxDispatch: ReturnType< typeof useDispatch >;
	responseCart: ResponseCart;
	getThankYouUrl: GetThankYouUrl;
	siteSlug: string | undefined;
	siteId: number | undefined;
	contactDetails: ManagedContactDetails | undefined;
	recaptchaClientId?: number;
}
