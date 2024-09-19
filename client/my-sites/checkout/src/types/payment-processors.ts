import type { GetThankYouUrl } from '../hooks/use-get-thank-you-url';
import type { RazorpayConfiguration } from '@automattic/calypso-razorpay';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';
import type { Stripe } from '@stripe/stripe-js';
import type { CalypsoDispatch } from 'calypso/state/types';

export interface PaymentProcessorOptions {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
	isAkismetSitelessCheckout: boolean;
	isJetpackNotAtomic: boolean;
	createUserAndSiteBeforeTransaction: boolean;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	razorpayConfiguration: RazorpayConfiguration | null;
	reduxDispatch: CalypsoDispatch;
	responseCart: ResponseCart;
	getThankYouUrl: GetThankYouUrl;
	siteSlug: string | undefined;
	siteId: number | undefined;
	contactDetails: ManagedContactDetails | undefined;
	recaptchaClientId?: number;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
}
