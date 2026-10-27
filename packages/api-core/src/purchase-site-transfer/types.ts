/**
 * Types for moving a purchase to another site the same user owns. The endpoints
 * wrap `WPCOM\Store\Site_Transfer` and mirror its value objects in snake_case.
 *
 * A transfer moves one primary item (the purchase being managed, plus any
 * subscriptions that must move with it) and any other items on the source site
 * that the user selects from the preview.
 */

/**
 * The handler that moves an item. `subscription` is used for subscriptions no
 * handler can move; those items always have a `blocker`.
 */
export type SiteTransferItemType =
	'plan' | 'domain' | 'storage_add_on' | 'jetpack_product' | 'subscription';

/**
 * A reason something can't move, or something the user should know first.
 * Mirrors `Transfer_Issue`.
 */
export interface SiteTransferIssue {
	/**
	 * Stable machine-readable code, e.g. `target_has_plan` or
	 * `bundled_domain_on_source`.
	 */
	code: string;
	/**
	 * Translated explanation for the person moving the purchase.
	 */
	message: string;
	/**
	 * For a warning about one of the preview's `items`, that item's
	 * subscriptions, so the warning can be hidden once the item is selected to
	 * move too (e.g. `bundled_domain_on_source` no longer applies once the
	 * domain moves with the plan). Absent when the warning applies regardless
	 * of the selection.
	 */
	subscription_ids?: number[];
}

/**
 * Subscriptions on a site that can only move together. Mirrors `Transfer_Item`,
 * except for its key, which is internal to `Site_Transfer`: an item is
 * identified by its subscriptions.
 */
export interface SiteTransferItem {
	type: SiteTransferItemType;
	/**
	 * Short description, e.g. the plan's name or the domain name.
	 */
	label: string;
	/**
	 * The subscriptions that move together. Any one of them names the item in
	 * a transfer request.
	 */
	subscription_ids: number[];
	/**
	 * Display names of those subscriptions' products, e.g. a domain's
	 * registration and its email.
	 */
	product_names: string[];
	/**
	 * Extra facts, e.g. that a domain was registered with a plan's credit.
	 */
	notes: string[];
	/**
	 * Why the item can't move with the primary item, or null when it can.
	 */
	blocker: SiteTransferIssue | null;
}

/**
 * Response of `GET /wpcom/v2/upgrades/{purchase_id}/site-transfer/preview`.
 * Mirrors `Site_Transfer_Preview`.
 */
export interface SiteTransferPreview {
	/**
	 * The item the purchase belongs to, or null when nothing matches.
	 */
	primary: SiteTransferItem | null;
	source_blog_id: number;
	target_blog_id: number;
	/**
	 * Whether the primary item can move. Equivalent to `blockers` being empty.
	 */
	can_transfer: boolean;
	/**
	 * Why the primary item can't move. Empty when it can.
	 */
	blockers: SiteTransferIssue[];
	/**
	 * What the user should know before moving it.
	 */
	warnings: SiteTransferIssue[];
	/**
	 * Other items on the source site, each of which may be selectable to move
	 * with the primary item.
	 */
	items: SiteTransferItem[];
	/**
	 * Fingerprint of the state the preview was built from. Send it back with
	 * the transfer; the transfer is refused if anything has changed since.
	 */
	state_token: string;
}

/**
 * Body of `POST /wpcom/v2/upgrades/{purchase_id}/site-transfer`. The purchase
 * in the path is the primary subscription.
 */
export interface SiteTransferRequest {
	target_blog_id: number;
	/**
	 * The `state_token` of the preview the user confirmed.
	 */
	state_token: string;
	/**
	 * A subscription in each of the preview's `items` to move with the primary
	 * item. Empty to move only the primary item.
	 */
	subscription_ids: number[];
}

/**
 * Response of `POST /wpcom/v2/upgrades/{purchase_id}/site-transfer`. Mirrors
 * `Site_Transfer_Result`.
 *
 * Failures reject with a WP REST error whose `code` is one of
 * `SiteTransferErrorCode`.
 */
export interface SiteTransferResult {
	primary: SiteTransferItem;
	source_blog_id: number;
	target_blog_id: number;
	/**
	 * The other items that moved with the primary item.
	 */
	moved_items: SiteTransferItem[];
}

/**
 * Error codes the transfer endpoint rejects with, from `Site_Transfer::transfer()`.
 */
export type SiteTransferErrorCode =
	| 'site_transfer_blocked'
	| 'site_transfer_stale_preview'
	| 'site_transfer_unknown_item'
	| 'site_transfer_item_cannot_move'
	| 'site_transfer_in_progress';
