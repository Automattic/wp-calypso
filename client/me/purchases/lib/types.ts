import type { Purchase } from '@automattic/api-core';
import type { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

/**
 * Callback types for the legacy `client/me/purchases` pages.
 */

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
