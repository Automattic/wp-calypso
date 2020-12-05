/**
 * External dependencies
 */
import type { StripeConfiguration } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import type { ReactStandardAction } from '../types/analytics';

export interface CardProcessorOptions {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
	createUserAndSiteBeforeTransaction: boolean;
	stripeConfiguration: StripeConfiguration;
	recordEvent: ( action: ReactStandardAction ) => void;
}
