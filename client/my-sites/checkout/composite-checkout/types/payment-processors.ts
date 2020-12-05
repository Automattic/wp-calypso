/**
 * Internal dependencies
 */
import type { ReactStandardAction } from '../types/analytics';

export interface CardProcessorOptions {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
	createUserAndSiteBeforeTransaction: boolean;
	recordEvent: ( action: ReactStandardAction ) => void;
}
