import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import {
	hasAmountAvailableToRefund,
	isExpiredOrRemoved,
	isRefundable,
} from 'calypso/lib/purchases';
import type { Purchase } from './types';

/**
 * Cancel intent sourced from the entry point the user came from.
 * `cancel`      = clicked "Cancel subscription" on Purchase Settings.
 * `remove`      = clicked "Remove subscription / Remove {product}" on Purchase Settings.
 * `auto-renew`  = toggled off auto-renew on Purchase Settings.
 * Absent means flag-off, old deep link, or flow-type heuristic fallback.
 */
export type CancelIntent = 'cancel' | 'remove' | 'auto-renew';

export function getCancelIntentFromQuery( query: {
	intent?: string | string[] | null;
} ): CancelIntent | null {
	const raw = Array.isArray( query.intent ) ? query.intent[ 0 ] : query.intent;
	return raw === 'cancel' || raw === 'remove' || raw === 'auto-renew' ? raw : null;
}

/**
 * The set of UI variants the cancel/confirmation screens can render. Currently
 * 1:1 with CancelIntent — kept as a separate alias because callers often
 * compute a display variant from intent plus a flow-type fallback.
 */
export type DisplayVariant = 'cancel' | 'remove' | 'auto-renew';

/**
 * Derives which screen variant to show from intent, with a flow-type fallback when intent is absent.
 */
export function getDisplayVariant( intent: CancelIntent | null, flowType: string ): DisplayVariant {
	if ( intent ) {
		return intent;
	}
	return flowType === CANCEL_FLOW_TYPE.REMOVE ? 'remove' : 'cancel';
}

/**
 * Derives which backend mutation to run from intent + purchase state.
 * Falls back to getPurchaseCancellationFlowType when intent is absent or the intent/state combo is invalid.
 */
export function getMutationFlowType( intent: CancelIntent | null, purchase: Purchase ): string {
	if ( ! intent ) {
		return getPurchaseCancellationFlowType( purchase );
	}

	// 'cancel' and 'auto-renew' both map to the disable-auto-renew flow when
	// auto-renew is on; both fall back to flow-type otherwise.
	if ( intent === 'cancel' || intent === 'auto-renew' ) {
		if ( purchase?.isAutoRenewEnabled ) {
			return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
		}
		return getPurchaseCancellationFlowType( purchase );
	}

	if ( purchase?.isAutoRenewEnabled && hasAmountAvailableToRefund( purchase ) ) {
		return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
	}
	return CANCEL_FLOW_TYPE.REMOVE;
}

/**
 * Finds a purchase by the slug of its associated product.
 * @param {Purchase[]} purchases List of purchases to search in
 * @param {string} slug Product slug
 * @returns {Purchase} Found purchase, if any
 */
export function getPurchaseByProductSlug(
	purchases: Purchase[],
	slug: string
): Purchase | undefined {
	return purchases.find( ( purchase ) => purchase.productSlug === slug );
}

/**
 * Returns the purchase cancellation flow.
 * @param {Purchase} purchase The purchase object
 */
export function getPurchaseCancellationFlowType( purchase: Purchase ): string {
	const isPlanRefundable = isRefundable( purchase );
	const isPlanAutoRenewing = purchase?.isAutoRenewEnabled ?? false;

	if ( isPlanRefundable && hasAmountAvailableToRefund( purchase ) ) {
		// If the subscription is refundable the subscription should be removed immediately.
		return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
	}

	// Expired or grace-period purchases (that aren't refundable) use the removal
	// flow, matching the "Remove" button on the manage-purchase page (parity
	// with the Dashboard).
	if ( isExpiredOrRemoved( purchase ) ) {
		return CANCEL_FLOW_TYPE.REMOVE;
	}

	if ( ! isPlanRefundable && isPlanAutoRenewing ) {
		// If the subscription is not refundable and auto-renew is on turn off auto-renew.
		return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
	}

	// If the subscription is not refundable and auto-renew is off subscription should be removed immediately.
	return CANCEL_FLOW_TYPE.REMOVE;
}
