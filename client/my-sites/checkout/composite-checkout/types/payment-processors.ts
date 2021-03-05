/**
 * External dependencies
 */
import { useDispatch } from 'react-redux';
import type { StripeConfiguration } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import type { ReactStandardAction } from '../types/analytics';

export interface PaymentProcessorOptions {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
	createUserAndSiteBeforeTransaction: boolean;
	stripeConfiguration: StripeConfiguration | null;
	recordEvent: ( action: ReactStandardAction ) => void;
	reduxDispatch: ReturnType< typeof useDispatch >;
}
