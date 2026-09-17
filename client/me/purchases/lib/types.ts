import type { Purchase } from '@automattic/api-core';
import type { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

/**
 * Raw-`Purchase` versions of the callback types in `calypso/lib/purchases/types`,
 * for the legacy `client/me/purchases` pages being migrated off the assembler
 * (SHILL-2256). Kept local so the camelCase originals can keep serving the pages
 * that have not migrated yet.
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
