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

export type MappingFreeTextProps = {
	cart: ResponseCart;
	domain: string;
	primaryWithPlansOnly: boolean;
	selectedSite: SiteData | undefined | null;
};

export type MappingPriceTextProps = {
	cart: ResponseCart;
	currencyCode: string;
	domain: string;
	productsList: Record< string, unknown >[];
	selectedSite: SiteData | undefined | null;
};

export type TransferFreeTextProps = {
	cart: ResponseCart;
	domain: string;
	isSignupStep: boolean;
	siteIsOnPaidPlan: boolean;
};

export type TransferSalePriceTextProps = {
	cart: ResponseCart;
	currencyCode: string;
	domain: string;
	productsList: Record< string, unknown >[];
};

export type TransferPriceTextProps = {
	cart: ResponseCart;
	currencyCode: string;
	domain: string;
	productsList: Record< string, unknown >[];
};

export type OptionInfoProps = MappingFreeTextProps &
	MappingPriceTextProps &
	TransferFreeTextProps &
	TransferSalePriceTextProps &
	TransferPriceTextProps;
