/**
 * Internal dependencies
 */
import * as Products from './products';
import * as Bundles from './bundles';
import * as LegacyPlans from './legacy-plans';
import type {
	PurchaseableItem,
	PurchaseableBundle,
	PurchaseableLegacyPlan,
	PurchaseableProduct,
	PurchaseableItemAttributes,
	PurchaseableItemDecorator,
} from './types';
import { BillingTerm, ItemType } from './attributes';

export * as Attributes from './attributes';
export * as Products from './products';
export * as Bundles from './bundles';
export * as LegacyPlans from './legacy-plans';

const itemsList: PurchaseableItem[] = Object.values( {
	...Products,
	...Bundles,
	...LegacyPlans,
} );

export const getItemBySlug = ( slug: string ): PurchaseableItem | null =>
	itemsList.filter( ( i ) => i.slug === slug )[ 0 ];

export const getItemsWithAttributes = (
	attributes: Partial< PurchaseableItemAttributes >
): PurchaseableItem[] =>
	itemsList.filter( ( item ) =>
		// @ts-expect-error: PurchaseableItemAttributes isn't explicitly indexable,
		//                   but we need to compare items dynamically by key here
		Object.entries( attributes ).every( ( [ key, val ] ) => item[ key ] === val )
	);

export const getOnlyItemWithAttributes = (
	attributes: Partial< PurchaseableItemAttributes >
): PurchaseableItem => {
	const matchingItems = getItemsWithAttributes( attributes );

	if ( matchingItems.length !== 1 ) {
		throw Error( `Expected exactly one matching result, but found ${ matchingItems.length }` );
	}

	return matchingItems[ 0 ];
};

export const getRelatedItems = (
	itemSlug: string,
	differentAttributes: Partial< PurchaseableItemAttributes >
): PurchaseableItem[] => {
	const item = getItemBySlug( itemSlug );
	if ( item === null ) {
		return [];
	}

	return getItemsWithAttributes( { ...item.attributes, ...differentAttributes } );
};

export const getOnlyRelatedItem = (
	itemSlug: string,
	differentAttributes: Partial< PurchaseableItemAttributes >
): PurchaseableItem => {
	const relatedItems = getRelatedItems( itemSlug, differentAttributes );

	if ( relatedItems.length !== 1 ) {
		throw Error( `Expected exactly one matching result, but found ${ relatedItems.length }` );
	}

	return relatedItems[ 0 ];
};

export const getItemBilledMonthly = ( slug: string ): PurchaseableItem | null => {
	try {
		return getOnlyRelatedItem( slug, { billingTerm: BillingTerm.MONTHLY } );
	} catch {
		return null;
	}
};

export const getItemBilledAnnually = ( slug: string ): PurchaseableItem | null => {
	try {
		return getOnlyRelatedItem( slug, { billingTerm: BillingTerm.ANNUAL } );
	} catch {
		return null;
	}
};

export const isProduct = ( item: PurchaseableItem ): item is PurchaseableProduct =>
	item.attributes.itemType === ItemType.PRODUCT;

export const isBundle = ( item: PurchaseableItem ): item is PurchaseableBundle =>
	item.attributes.itemType === ItemType.BUNDLE;

export const isLegacyPlan = ( item: PurchaseableItem ): item is PurchaseableLegacyPlan =>
	item.attributes.itemType === ItemType.LEGACY_PLAN;

export const decorateItem = (
	item: PurchaseableItem,
	decorators: PurchaseableItemDecorator< PurchaseableItem >[]
): PurchaseableItem => decorators.reduce( ( result, dec ) => dec( result ), item );

export const decorateItems = (
	items: PurchaseableItem[],
	decorators: PurchaseableItemDecorator< PurchaseableItem >[]
): PurchaseableItem[] => items.map( ( i ) => decorateItem( i, decorators ) );
