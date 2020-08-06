/**
 * Internal dependencies
 */
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';

export type Duration = typeof TERM_ANNUALLY | typeof TERM_MONTHLY;

export type PurchaseCallback = ( arg0: string ) => null;

export interface SelectorPageProps {
	defaultDuration?: Duration;
}

export interface DetailsPageProps {
	duration?: Duration;
	productType: string;
}

export interface UpsellPageProps {
	duration: Duration;
	productSlug: string;
}
