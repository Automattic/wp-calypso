import type {
	SiteTransferIssue,
	SiteTransferItem,
	SiteTransferPreview,
} from '@automattic/api-core';

/**
 * Items are identified by their subscriptions. An item is selected when any of
 * its subscriptions is in the selection.
 */
export function isItemSelected( item: SiteTransferItem, selection: Set< number > ): boolean {
	return item.subscription_ids.some( ( id ) => selection.has( id ) );
}

export function isBundledItem(
	item: SiteTransferItem,
	bundledDomainSubscriptionId: number | null
): boolean {
	return (
		bundledDomainSubscriptionId !== null &&
		item.subscription_ids.includes( bundledDomainSubscriptionId )
	);
}

/**
 * The items offered to move along with the purchase. Only a plan offers any:
 * the site's domains, with the plan's bundled domain first. Everything else on
 * the site stays put.
 */
export function getCompanionItems(
	preview: SiteTransferPreview,
	bundledDomainSubscriptionId: number | null
): SiteTransferItem[] {
	if ( preview.primary?.type !== 'plan' ) {
		return [];
	}

	const domains = preview.items.filter( ( item ) => item.type === 'domain' );

	return [
		...domains.filter( ( item ) => isBundledItem( item, bundledDomainSubscriptionId ) ),
		...domains.filter( ( item ) => ! isBundledItem( item, bundledDomainSubscriptionId ) ),
	];
}

/**
 * The plan's bundled domain is selected to move with it by default, since a
 * plan bought on the wrong site usually means its domain was too.
 */
export function getDefaultSelection(
	companions: SiteTransferItem[],
	bundledDomainSubscriptionId: number | null
): Set< number > {
	const bundledDomain = companions.find( ( item ) =>
		isBundledItem( item, bundledDomainSubscriptionId )
	);

	return new Set( bundledDomain && ! bundledDomain.blocker ? bundledDomain.subscription_ids : [] );
}

/**
 * Warnings about an item stop applying once that item moves too.
 */
export function getVisibleWarnings(
	preview: SiteTransferPreview,
	companions: SiteTransferItem[],
	selection: Set< number >
): SiteTransferIssue[] {
	const movingIds = new Set(
		companions
			.filter( ( item ) => ! item.blocker && isItemSelected( item, selection ) )
			.flatMap( ( item ) => item.subscription_ids )
	);

	return preview.warnings.filter(
		( warning ) => ! warning.subscription_ids?.some( ( id ) => movingIds.has( id ) )
	);
}

/**
 * One subscription from each selected item, which is all the transfer request
 * needs to name the item.
 */
export function getSelectedSubscriptionIds(
	items: SiteTransferItem[],
	selection: Set< number >
): number[] {
	return items
		.filter( ( item ) => ! item.blocker && isItemSelected( item, selection ) )
		.map( ( item ) => item.subscription_ids[ 0 ] );
}
