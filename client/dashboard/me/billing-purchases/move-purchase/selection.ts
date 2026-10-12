import type {
	Purchase,
	SiteTransferIssue,
	SiteTransferItem,
	SiteTransferPreview,
} from '@automattic/api-core';

/**
 * The key of the domain registered with the plan's free domain credit, in the
 * form the preview uses for domain items.
 */
export function getBundledDomainKey( purchase: Purchase ): string | undefined {
	return purchase.included_domain
		? `domain:${ purchase.included_domain.toLowerCase() }`
		: undefined;
}

/**
 * The items offered to move along with the purchase. Only a plan offers any:
 * the site's domains, with the plan's bundled domain first. Everything else on
 * the site stays put.
 */
export function getCompanionItems(
	preview: SiteTransferPreview,
	purchase: Purchase
): SiteTransferItem[] {
	if ( preview.primary?.type !== 'plan' ) {
		return [];
	}

	const bundledDomainKey = getBundledDomainKey( purchase );
	const domains = preview.items.filter( ( item ) => item.type === 'domain' );

	return [
		...domains.filter( ( item ) => item.key === bundledDomainKey ),
		...domains.filter( ( item ) => item.key !== bundledDomainKey ),
	];
}

/**
 * The plan's bundled domain is selected to move with it by default, since a
 * plan bought on the wrong site usually means its domain was too.
 */
export function getDefaultSelection(
	preview: SiteTransferPreview,
	purchase: Purchase
): Set< string > {
	const bundledDomainKey = getBundledDomainKey( purchase );
	const bundledDomain = getCompanionItems( preview, purchase ).find(
		( item ) => item.key === bundledDomainKey
	);

	return new Set( bundledDomain && ! bundledDomain.blocker ? [ bundledDomain.key ] : [] );
}

/**
 * Warnings about an item stop applying once that item moves too.
 */
export function getVisibleWarnings(
	preview: SiteTransferPreview,
	selectedKeys: Set< string >
): SiteTransferIssue[] {
	return preview.warnings.filter(
		( warning ) => ! warning.item_key || ! selectedKeys.has( warning.item_key )
	);
}

/**
 * One subscription from each selected item, which is all the transfer request
 * needs to name the item.
 */
export function getSelectedSubscriptionIds(
	items: SiteTransferItem[],
	selectedKeys: Set< string >
): number[] {
	return items
		.filter( ( item ) => selectedKeys.has( item.key ) && ! item.blocker )
		.map( ( item ) => item.subscription_ids[ 0 ] );
}
