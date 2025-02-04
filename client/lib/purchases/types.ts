import { Purchases } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { ResponseDomain } from '../domains/types';

export type Purchase = Purchases.Purchase;
export type PurchasePriceTier = Purchases.PurchasePriceTier;
export type RawPurchasePriceTierEntry = Purchases.RawPurchasePriceTierEntry;
export type RawPurchase = Purchases.RawPurchase;
export type RawPurchaseCreditCard = Purchases.RawPurchaseCreditCard;
export type RefundOptions = Purchases.RefundOptions;
export type RawPurchaseIntroductoryOffer = Purchases.RawPurchaseIntroductoryOffer;
export type PurchaseIntroductoryOffer = Purchases.PurchaseIntroductoryOffer;
export type PurchasePayment = Purchases.PurchasePayment;
export type PurchasePaymentWithPayPal = Purchases.PurchasePaymentWithPayPal;
export type PurchasePaymentWithCreditCard = Purchases.PurchasePaymentWithCreditCard;
export type PurchasePaymentCreditCard = Purchases.PurchasePaymentCreditCard;

export interface MembershipSubscription {
	ID: string;
	currency: string;
	end_date: string | null;
	product_id: string;
	renew_interval: string | null;
	renewal_price: string;
	site_id: string;
	site_title: string;
	site_url: string;
	start_date: string;
	status: string;
	title: string;
}

export interface MembershipSubscriptionsSite {
	id: string;
	name: string;
	domain: string;
	subscriptions: MembershipSubscription[];
}

export interface Owner {
	ID: number;
	display_name?: string;
}
export type GetChangePaymentMethodUrlFor = ( siteSlug: string, purchase: Purchase ) => string;
export type GetManagePurchaseUrlFor = (
	siteSlug: string,
	attachedToPurchaseId: string | number
) => string;

export type RenderRenewsOrExpiresOn = ( args: {
	moment: ReturnType< typeof useLocalizedMoment >;
	purchase: Purchase;
	siteSlug: string | undefined;
	translate: ReturnType< typeof useTranslate >;
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
} ) => JSX.Element | null;

export type RenderRenewsOrExpiresOnLabel = ( args: {
	purchase: Purchase;
	domainDetails?: ResponseDomain | null;
	translate: ReturnType< typeof useTranslate >;
} ) => string | null;
