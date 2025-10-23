import type { Receipt } from '@automattic/api-core';

export function getReceiptUrlFor( receipt: Receipt ): string {
	return `/me/billing/billing-history/${ receipt.id }`;
}
