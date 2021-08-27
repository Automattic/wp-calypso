/**
 * External dependencies
 */
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ResponseCart } from '@automattic/shopping-cart';
/**
 * Internal dependencies
 */

export type ConnectDomainFunctionProps = {
	domain: string;
	selectedSite: SiteData | undefined | null;
};

export type ConnectDomainFunction = ( props: ConnectDomainFunctionProps ) => void;

export type TransferDomainFunctionProps = {
	domain: string;
	selectedSite: SiteData | undefined | null;
	transferDomainUrl: string;
};

export type TransferDomainFunction = ( props: TransferDomainFunctionProps ) => void;

export type OptionInfoProps = {
	availability: Record< string, unknown >;
	cart: ResponseCart;
	currencyCode: string;
	domain: string;
	isSignupStep: boolean;
	onConnect: ConnectDomainFunction;
	onTransfer: TransferDomainFunction;
	primaryWithPlansOnly: boolean;
	productsList: Record< string, unknown >[];
	selectedSite: SiteData | undefined | null;
	siteIsOnPaidPlan: boolean;
};

export type TransferFreeTextProps = Pick<
	OptionInfoProps,
	'cart' | 'domain' | 'isSignupStep' | 'siteIsOnPaidPlan'
>;
