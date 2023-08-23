import type { TranslateResult } from 'i18n-calypso';

export type AddOnObject = {
	getSlug: () => string;
	getTitle: ( domainName?: string ) => TranslateResult;
	getDescription?: ( domainName?: string ) => TranslateResult;
	getCompareTitle?: () => TranslateResult;
	isPlan?: boolean;
	getQuantity?: () => number; // storage add-ons are a quantity based product. this determines checkout price
	getUnitProductSlug?: () => string; // used for storage add-ons to determine the checkout item
};

export type AddOnList = {
	[ key: string ]: AddOnObject;
};
