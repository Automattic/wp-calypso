/**
 * Internal dependencies
 */
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { ALL, PERFORMANCE, SECURITY } from './constants';

export type Duration = typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
export type ProductType = typeof ALL | typeof PERFORMANCE | typeof SECURITY;
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
